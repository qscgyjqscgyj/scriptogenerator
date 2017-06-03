# -*- coding: utf-8 -*-
import json
from copy import copy

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
    date_today = datetime.datetime.now()
    return {
        'id': current_milli_time(),
        'name': u'Новая таблица',
        'text_coll_name': u'Блок с текстом',
        'text_coll_size': 50,
        'text_coll_position': 0,
        'date': date_today.isoformat(),
        'date_mod': date_today.isoformat(),
        'colls': [get_empty_coll()]
    }


def get_empty_coll():
    return {
        'id': current_milli_time(),
        'name': u'Новый блок',
        'size': 50,
        'position': 1,
        'categories': []
    }


def get_empty_category(hidden=False):
    return {
        'id': current_milli_time(),
        'name': u'Новая категория',
        'hidden': hidden,
        'order': 1,
        'opened': False,
        'links': [],
        'edit': False
    }


def get_empty_link(to_link=None):
    return {
        'id': current_milli_time(),
        'name': u'Новая ссылка',
        'to_link': to_link,
        'text': None,
        'order': 1,
        'opened': False,
        'edit': False
    }


def clone_table(table):
    date_today = datetime.datetime.now()

    new_table = copy(table)
    new_table['id'] = current_milli_time()
    new_table['date'] = date_today.isoformat()
    new_table['date_mod'] = date_today.isoformat()
    if new_table['colls']:
        for coll_index, coll in enumerate(new_table['colls']):
            new_table['colls'][coll_index] = clone_coll(coll)
    return new_table


def clone_coll(coll):
    new_coll = copy(coll)
    new_coll['id'] = current_milli_time()
    if new_coll['categories']:
        for category_index, category in enumerate(new_coll['categories']):
            new_coll['categories'][category_index] = clone_category(category)
    return new_coll


def clone_category(category):
    new_category = copy(category)
    new_category['id'] = current_milli_time()
    if new_category['links']:
        for link_index, link in enumerate(new_category['links']):
            new_category['links'][link_index] = clone_link(link)
    return new_category


def clone_link(link):
    new_link = copy(link)
    new_link['id'] = current_milli_time()
    return new_link
