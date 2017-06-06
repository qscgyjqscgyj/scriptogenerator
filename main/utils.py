# -*- coding: utf-8 -*-
import json
from copy import copy

import gc
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import get_current_site
from registration.models import RegistrationProfile

from main.models import Script
from main.tasks import send_new_user_data_email
from users.models import CustomUser
from django.db import IntegrityError
import time
import datetime
import uuid


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


def get_uuid():
    return uuid.uuid1().int>>64


def get_empty_table():
    date_today = datetime.datetime.now()
    return {
        'id': get_uuid(),
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
        'id': get_uuid(),
        'name': u'Новый блок',
        'size': 50,
        'position': 1,
        'categories': []
    }


def get_empty_category(hidden=False):
    return {
        'id': get_uuid(),
        'name': u'Новая категория',
        'hidden': hidden,
        'order': 1,
        'opened': False,
        'links': [],
        'edit': False
    }


def get_empty_link(to_link=None):
    return {
        'id': get_uuid(),
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
    new_table['id'] = get_uuid()
    new_table['date'] = date_today.isoformat()
    new_table['date_mod'] = date_today.isoformat()
    if new_table['colls']:
        for coll_index, coll in enumerate(new_table['colls']):
            new_table['colls'][coll_index] = clone_coll(coll)
    return new_table


def clone_coll(coll):
    new_coll = copy(coll)
    new_coll['id'] = get_uuid()
    if new_coll['categories']:
        for category_index, category in enumerate(new_coll['categories']):
            new_coll['categories'][category_index] = clone_category(category)
    return new_coll


def clone_category(category):
    new_category = copy(category)
    new_category['id'] = get_uuid()
    if new_category['links']:
        for link_index, link in enumerate(new_category['links']):
            new_category['links'][link_index] = clone_link(link)
    return new_category


def clone_link(link):
    new_link = copy(link)
    new_link['id'] = get_uuid()
    return new_link


def hot_fix_ids(script_id=None):
    scripts = Script.objects.all() if not script_id else Script.objects.filter(id=script_id)
    for i, script in enumerate(scripts):
        print('Script: ' + script.name)
        print('Iteration: ' + str(i))
        tables = script.tables()

        tables_ids = []
        for table_index, table in enumerate(tables):
            tables_with_duplicates = False
            colls_with_duplicates = False
            categories_with_duplicates = False
            links_with_duplicates = False

            if table['id'] in tables_ids:
                tables[table_index]['id'] = get_uuid()
                tables_with_duplicates = True
                print('TABLE IS DUPLICATE!!!')
            else:
                tables_ids.append(table['id'])

            if table['colls']:
                colls_ids = []
                for coll_index, coll in enumerate(table['colls']):
                    if coll['id'] in colls_ids:
                        tables[table_index]['colls'][coll_index]['id'] = get_uuid()
                        colls_with_duplicates = True
                        print('COLL IS DUPLICATE!!!')
                    else:
                        colls_ids.append(coll['id'])

                    if coll['categories']:
                        categories_ids = []
                        for category_index, category in enumerate(coll['categories']):
                            if category['id'] in categories_ids:
                                tables[table_index]['colls'][coll_index]['categories'][category_index]['id'] = get_uuid()
                                categories_with_duplicates = True
                                print('CATEGORY IS DUPLICATE!!!')
                            else:
                                categories_ids.append(category['id'])

                            if category['links']:
                                links_ids = []
                                for link_index, link in enumerate(category['links']):
                                    if link['id'] in links_ids:
                                        tables[table_index]['colls'][coll_index]['categories'][category_index]['links'][link_index]['id'] = get_uuid()
                                        links_with_duplicates = True
                                        print('LINK IS DUPLICATE!!!')
                                    else:
                                        links_ids.append(link['id'])
            if tables_with_duplicates or colls_with_duplicates or categories_with_duplicates or links_with_duplicates:
                script.replace_table(tables[table_index], table_index)
        gc.collect()
        print('------------------------')
