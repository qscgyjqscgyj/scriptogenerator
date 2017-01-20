# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth import authenticate, login
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model

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
    PRESENT_SUM = 500.0
    payment = get_model('payment', 'UserPayment')(
        user=user,
        sum=PRESENT_SUM,
        total_sum=PRESENT_SUM,
        payed=datetime.datetime.today(),
        payment_data=u'Подарок при регистрации'
    )
    payment.save()

    user.balance_real = PRESENT_SUM
    user.balance_total = PRESENT_SUM
    user.is_active = True
    user.save()

    return login(request, authenticate(
        username=user.username,
        password=request.POST['password1']
    ))
