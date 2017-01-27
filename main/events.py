# -*- coding: utf-8 -*-
import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model
from scripts.tasks import cloneTreeRelations, clone_save_links

PRESENT_SCRIPT_ID = 275
PRESENT_SUM = 500.0


def take_presents_to_user(user, sum=PRESENT_SUM, title=u'Подарок при регистрации', present_script=True):
    if present_script:
        try:
            current_script = get_model('main', 'Script').objects.get(pk=PRESENT_SCRIPT_ID)
            current_script_links_count = len(current_script.links())
            clone_script = get_model('main', 'Script').objects.get(pk=PRESENT_SCRIPT_ID)
            clone_script.owner = user
            clone_script.pk = None
            clone_script.active = False
            clone_script.save()
            cloneTreeRelations.delay(current_script.pk, clone_script.pk, 'main', 'Script')
            clone_save_links.delay(clone_script.pk, current_script_links_count)
        except ObjectDoesNotExist:
            print('Present script does not found.')
    payment = get_model('payment', 'UserPayment')(
        user=user,
        sum=sum,
        total_sum=sum,
        payed=datetime.datetime.today(),
        payment_data=title
    )
    payment.save()
    user.balance_real = sum
    user.balance_total = sum
    user.save()
    return True
