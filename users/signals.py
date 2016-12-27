# -*- coding: utf-8 -*-
import datetime
import time
from django.contrib.auth import authenticate, login
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model

from payment.tasks import recount_balance
from scripts.tasks import cloneTreeRelations, clone_save_links


def user_created(sender, user, request, **kwargs):
    # GIVE SCRIPT TEMPLATE FOR NEW USER
    try:
        current_script = get_model('main', 'Script').objects.get(pk=275)
        current_script_links_count = len(current_script.links())

        clone_script = get_model('main', 'Script').objects.get(pk=275)
        clone_script.owner = user
        clone_script.pk = None
        clone_script.active = False
        clone_script.save()
        cloneTreeRelations.delay(current_script.pk, clone_script.pk, 'main', 'Script')
        clone_save_links.delay(clone_script.pk, current_script_links_count)
    except ObjectDoesNotExist:
        print('Present script does not found.')

    # GIVE 500 RUBLES FOR NEW USER
    payment = get_model('payment', 'UserPayment').objects.create(
        user=user,
        sum=500.0,
        total_sum=500.0,
        payed=datetime.datetime.today(),
        payment_data=u'Подарок при регистрации'
    )

    payments = user.payments()
    print(len(payments))
    while not len(payments) > 0:
        print(len(payments))
        time.sleep(1)
        payments = user.payments()
    recount_balance.delay(payment.user.pk)

    return login(request, authenticate(
        username=user.username,
        password=request.POST['password1']
    ))
