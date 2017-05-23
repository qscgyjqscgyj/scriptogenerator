# -*- coding: utf-8 -*-
import datetime
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from main.models import Script
from payment.tasks import recount_balance
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


class LocalPayment(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(CustomUser, related_name='local_payment_user_custom_user')
    sum = models.FloatField(default=0.0)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class UserScriptDelegationAccess(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_script_delegation_access_custom_user')
    delegated_user = models.ForeignKey(CustomUser, related_name='user_script_delegation_access_delegated_user_custom_user', blank=True, null=True)
    delegated_script = models.ForeignKey(Script, related_name='user_script_delegation_access_delegated_script_script', blank=True, null=True)
    delegated = models.BooleanField(default=False)
    payed = models.DateTimeField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.user.__unicode__()


class UserOfflineScriptExportAccess(models.Model):
    user = models.ForeignKey(CustomUser, related_name='user_offline_script_export_access_custom_user')
    script = models.ForeignKey(Script, on_delete=models.SET_NULL, blank=True, null=True)
    script_data = models.TextField(blank=True, null=True)
    exported = models.BooleanField(default=False)
    unlim_months = models.IntegerField(blank=True, null=True)
    payed = models.DateTimeField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.user.__unicode__()

    def unlime_datetime_expires(self):
        return self.payed + datetime.timedelta(self.unlim_months * 365 / 12)

    def unlim_is_expired(self):
        return True if datetime.datetime.now() < self.unlime_datetime_expires() else False
