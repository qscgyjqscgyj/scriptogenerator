# -*- coding: utf-8 -*-
import datetime
import json

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.db.models.loading import get_model
from registration.signals import user_registered
from celery.result import AsyncResult

from users.signals import user_created


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=1025, blank=True, null=True)
    middle_name = models.CharField(max_length=30, blank=True, null=True)
    company = models.CharField(max_length=30, blank=True, null=True)
    balance_real = models.FloatField(default=0.0)
    balance_total = models.FloatField(default=0.0)
    utm = models.TextField(blank=True, null=True)

    objects = UserManager()

    def __unicode__(self):
        return self.username

    def payments(self):
        return get_model('payment', 'UserPayment').objects.filter(user=self, payed__isnull=False)

    def promoted(self):
        return True if get_model('payment', 'UserPayment').objects.filter(user=self, promotion=True) else False

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'

user_registered.connect(user_created)


class UserAccess(models.Model):
    owner = models.ForeignKey(CustomUser, related_name='user_access_owner_custom_user')
    user = models.ForeignKey(CustomUser, related_name='user_access_user_custom_user')
    payed = models.DateTimeField(blank=True, null=True)
    active = models.BooleanField(default=False)

    def clear_script_accesses_and_delete(self):
        for script in get_model('main', 'Script').objects.filter(owner=self.owner):
            for script_access in get_model('main', 'ScriptAccess').objects.filter(script=script, user=self.user):
                script_access.delete()
        self.delete()

    def active_to_pay(self):
        if not self.payed:
            return True
        elif self.payed.date() < datetime.datetime.today().date():
            return True
        return False

    def __unicode__(self):
        return self.owner.__unicode__()
