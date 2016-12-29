# -*- coding: utf-8 -*-
import datetime
from celery.schedules import crontab
from celery.task import periodic_task
from django.db.models.loading import get_model

from scripts.celery import app
from constance import config
from django.db.models import Q


@periodic_task(run_every=(crontab(minute=0, hour=0)))
def get_payment_for_users():
    today = datetime.datetime.today()
    for user in get_model('users', 'CustomUser').objects.all():
        for access in get_model('users', 'UserAccess').objects.filter(Q(active=True) & Q(owner=user) & (Q(payed__isnull=True) | Q(payed__date__lt=today.date()))):
            get_payment_for_user.delay(access.pk)


@periodic_task(run_every=(crontab(minute=0, hour=1)))
def recount_balances():
    for user in get_model('users', 'CustomUser').objects.all():
        recount_balance.delay(user.pk)


@app.task
def get_payment_for_user(access_pk):
    access = get_model('users', 'UserAccess').objects.get(pk=access_pk)
    local_payment = get_model('payment', 'LocalPayment')(
        name=u'Списание абонентской оплаты за доступ пользователю: %(email)s' % dict(email=access.user.email),
        user=access.owner,
        sum=config.PAYMENT_PER_USER
    )
    local_payment.save()
    return recount_balance(user_pk=access.owner.pk)


@app.task
def recount_balance(user_pk=None):
    if user_pk:
        users = get_model('users', 'CustomUser').objects.filter(pk=user_pk)
    else:
        users = get_model('users', 'CustomUser').objects.all()

    for user in users:
        user_balance_real = 0.0
        user_balance_total = 0.0
        user_local_payments = 0.0

        for payment in get_model('payment', 'UserPayment').objects.filter(user=user, payed__isnull=False):
            user_balance_real += payment.sum
            user_balance_total += payment.total_sum
        for payment in get_model('payment', 'LocalPayment').objects.filter(user=user):
            user_local_payments += payment.sum

        user.balance_real = user_balance_real - user_local_payments
        user.balance_total = user_balance_total - user_local_payments
        user.save()
    return users