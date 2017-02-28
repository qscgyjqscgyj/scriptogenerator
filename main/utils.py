# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import get_current_site
from registration.models import RegistrationProfile

from main.tasks import send_new_user_data_email
from users.models import CustomUser
from django.db import IntegrityError
import time
import datetime


def create_active_user(request, email, last_name='', first_name='', middle_name='', phone=''):
    try:
        user = CustomUser.objects.create(
            username=email,
            email=email,
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            phone=phone
        )
        password = CustomUser.objects.make_random_password(length=10)
        user.set_password(password)
        user.save()
    except IntegrityError:
        return False

    new_user = RegistrationProfile.objects.create_inactive_user(
        new_user=user,
        site=get_current_site(request),
        request=request,
        send_email=False
    )
    new_user.is_active = True
    new_user.save()
    send_new_user_data_email.delay(email, password)
    return {'user': new_user, 'password': password}


def current_milli_time():
    return int(round(time.time() * 1000))


def get_empty_table():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': u'Новая таблица',
        'text_coll_name': u'Блок с текстом',
        'text_coll_size': 50,
        'text_coll_position': 0,
        'date': datetime.datetime.now().isoformat(),
        'date_mod': datetime.datetime.now().isoformat(),
        'colls': []
    }


def get_empty_coll():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': u'Новый блок',
        'size': 10,
        'position': 1,
        'categories': []
    }


def get_empty_category():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': u'Новая категория',
        'hidden': False,
        'order': 1,
        'opened': False,
        'links': []
    }


def get_empty_link():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': u'Новая ссылка',
        'to_link': None,
        'text': None,
        'order': 1,
        'opened': False,
    }
