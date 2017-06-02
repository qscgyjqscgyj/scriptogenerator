# -*- coding: utf-8 -*-
import datetime
import json

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import Script
from main.serializers.script import ScriptSerializer
from payment.managers import UserOfflineScriptExportAccessManager, UserScriptDelegationAccessManager
from payment.tasks import recount_balance
from scripts.utils import readable_datetime_format, datetime_handler
from users.models import CustomUser


class UserPayment(models.Model):
    name = models.CharField(default='Пополнение счета', max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='user_payment_user_custom_user')
    sum = models.FloatField(default=0)
    total_sum = models.FloatField(default=0)
    payment_data = models.TextField(blank=True, null=True)
    payed = models.DateTimeField(blank=True, null=True)
    promotion = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if not self.total_sum or self.total_sum < self.sum:
            self.total_sum = self.sum
        return super(UserPayment, self).save(force_insert=False, force_update=False, using=None, update_fields=None)

    def __unicode__(self):
        return self.user.__unicode__()


def recount_payment_user_balance(sender, instance, **kwargs):
    return recount_balance.delay()
post_save.connect(recount_payment_user_balance, sender=UserPayment)


def create_payment_log_from_user_payment(sender, instance, created, **kwargs):
    if created and instance.payed:
        payment_log = PaymentLog()
        return payment_log.create_from_user_payment(instance)
post_save.connect(create_payment_log_from_user_payment, sender=UserPayment)


class LocalPayment(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='local_payment_user_custom_user')
    sum = models.FloatField(default=0.0)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.name


def create_payment_log_from_local_payment(sender, instance, created, **kwargs):
    if created:
        payment_log = PaymentLog()
        return payment_log.create_from_local_payment(instance)
post_save.connect(create_payment_log_from_local_payment, sender=LocalPayment)


class PaymentLog(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='payment_log_user_custom_user')
    sum = models.FloatField(blank=True, null=True)
    debit_credit = models.IntegerField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)

    def __unicode__(self):
        return self.name

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if not self.date:
            self.date = datetime.datetime.now()
        return super(PaymentLog, self).save(force_insert=False, force_update=False, using=None, update_fields=None)

    def create_from_user_payment(self, user_payment):
        if user_payment.sum > 0:
            self.name = user_payment.name
            self.user = user_payment.user
            self.sum = user_payment.sum
            self.debit_credit = 1
            self.date = user_payment.payed
            self.save()

    def create_from_local_payment(self, local_payment):
        if local_payment.sum > 0:
            self.name = local_payment.name
            self.user = local_payment.user
            self.sum = local_payment.sum
            self.debit_credit = -1
            self.date = local_payment.date
            self.save()

    class Meta:
        ordering = ('-pk',)


class UserScriptDelegationAccess(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_script_delegation_access_custom_user')
    delegated_user = models.ForeignKey(CustomUser, related_name='user_script_delegation_access_delegated_user_custom_user', blank=True, null=True)
    delegated_script = models.ForeignKey(Script, related_name='user_script_delegation_access_delegated_script_script', blank=True, null=True)
    delegated = models.BooleanField(default=False)
    payed = models.DateTimeField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    objects = UserScriptDelegationAccessManager()

    def __unicode__(self):
        return self.user.__unicode__()

    def delegate(self, to_user, script):
        self.delegated_user = to_user
        self.delegated_script = script
        self.delegated = True
        self.save()
        PaymentLog.objects.create(
            name=u'Делегирование скрипта "%(script_name)s" пользователю "%(to_user_name)s"' % dict(script_name=script.name, to_user_name=to_user.username),
            user=self.user,
            date=datetime.datetime.now()
        )


class UserOfflineScriptExportAccess(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_offline_script_export_access_custom_user')
    exported = models.BooleanField(default=False)
    script = models.ForeignKey(Script, on_delete=models.SET_NULL, blank=True, null=True)
    script_data = models.TextField(blank=True, null=True)
    exported_date = models.DateTimeField(blank=True, null=True)
    unlim_months = models.IntegerField(blank=True, null=True)
    payed = models.DateTimeField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    objects = UserOfflineScriptExportAccessManager()

    def __unicode__(self):
        return self.user.__unicode__()

    def unlime_datetime_expires(self):
        return self.payed + datetime.timedelta(self.unlim_months * 365 / 12)

    def unlim_is_expired(self):
        return True if datetime.datetime.now() < self.unlime_datetime_expires() else False

    def create_offline_scripts_data(self, script):
        script_data = json.dumps(ScriptSerializer(script).data, default=datetime_handler)
        date_today = datetime.datetime.now()
        if self.unlim_months:
            UserOfflineScriptExportAccess.objects.create(
                user=self.user,
                exported=True,
                script=script,
                script_data=script_data,
                exported_date=date_today,
                payed=self.payed
            )
        elif not self.exported:
            self.exported = True
            self.script = script
            self.script_data = script_data
            self.exported_date = date_today
            self.save()
        PaymentLog.objects.create(
            name=u'Услуга "Выгрузка скрипта" - активирована. Скрипт "%(script_name)s" экспортирован.' % dict(script_name=script.name),
            user=self.user,
            date=date_today
        )

    def update_offline_script_data(self):
        if self.exported and self.script_data and self.script:
            actual_user_offline_script_export_access = self.__class__.objects.get_actual_user_offline_script_export_access(self.user)
            if actual_user_offline_script_export_access:
                actual_user_offline_script_export_access.create_offline_scripts_data(self.script)
                self.delete()

    class Meta:
        ordering = ('-pk',)


def create_payment_log_for_new_unlim_offline_script_export_access(sender, instance, created, **kwargs):
    if created and instance.unlim_months:
        PaymentLog.objects.create(
            name=u'Безлимитная выгрузка скрипта активирована. Дата завершения: %(expires_date)s' % dict(
                expires_date=readable_datetime_format(instance.unlime_datetime_expires())
            ),
            user=instance.user,
            date=instance.payed
        )
post_save.connect(create_payment_log_for_new_unlim_offline_script_export_access, sender=UserOfflineScriptExportAccess)
