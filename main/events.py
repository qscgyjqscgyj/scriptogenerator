# -*- coding: utf-8 -*-
import datetime
import json

from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model
from scripts.tasks import clone_script_with_relations

PRESENT_SUM = 500.0


def take_presents_to_user(user, sum=PRESENT_SUM, title=u'Подарок при регистрации', present_script=True, promotion=False):
    if present_script:
        present_scripts = get_model('main', 'Script').objects.filter(is_present=True)
        if present_scripts:
            clone_script_with_relations(present_scripts[0].pk, [('owner', user), ('active', False)])
        else:
            print('Present script does not found.')
    payment = get_model('payment', 'UserPayment')(
        user=user,
        sum=sum,
        total_sum=sum,
        payed=datetime.datetime.today(),
        payment_data=title,
        promotion=promotion
    )
    payment.save()
    user.balance_real = sum
    user.balance_total = sum
    user.save()
    return True
