# -*- coding: utf-8 -*-
import json
from copy import copy

import gc
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import get_current_site
from django.db.models.loading import get_model
from registration.models import RegistrationProfile

from main.tasks import send_new_user_data_email
from django.db import IntegrityError
import time
import datetime
import uuid
import time


def create_active_user(request, email, last_name='', first_name='', middle_name='', phone=''):
    try:
        user = get_model('users', 'CustomUser').objects.create(
            username=email,
            email=email,
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            phone=phone
        )
        password = get_model('users', 'CustomUser').objects.make_random_password(length=10)
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
    return uuid.uuid4().hex


def get_empty_table():
    date_today = datetime.datetime.now()
    return {
        'id': get_uuid(),
        'name': u'Новый сценарий',
        'text_coll_name': u'Блок с текстом',
        'text_coll_size': 50,
        'text_coll_position': 2,
        'date': date_today.isoformat(),
        'date_mod': date_today.isoformat(),
        'colls': [
            get_empty_coll(size=20, position=1, default_category_name=u'Начало разговора'),
            get_empty_coll(size=30, position=3, default_category_name=u'Вопросы клиента')
        ]
    }


def get_empty_coll(size=None, position=None, default_category_name=None):
    return {
        'id': get_uuid(),
        'name': u'Новый блок',
        'size': 50 if not size else size,
        'position': 1 if not position else position,
        'categories': [get_empty_category(name=default_category_name)]
    }


def get_empty_category(hidden=False, name=None):
    return {
        'id': get_uuid(),
        'name': u'Новая категория' if not name else name,
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
    scripts = get_model('main', 'Script').objects.all() if not script_id else get_model('main', 'Script').objects.filter(id=script_id)
    for i, script in enumerate(scripts):
        print('Script: ' + script.name)
        print('Iteration: ' + str(i))
        tables = script.tables()

        tables_with_duplicates = False
        colls_with_duplicates = False
        categories_with_duplicates = False
        links_with_duplicates = False

        tables_ids = []
        colls_ids = []
        categories_ids = []
        links_ids = []

        for table_index, table in enumerate(tables):
            if table['id'] in tables_ids or isinstance(table['id'], long):
                tables[table_index]['id'] = get_uuid()
                tables_with_duplicates = True
            elif isinstance(table['id'], int):
                tables[table_index]['id'] = str(table['id'])
                tables_with_duplicates = True
            else:
                tables_ids.append(table['id'])

            if table['colls']:
                for coll_index, coll in enumerate(table['colls']):
                    if coll['id'] in colls_ids or isinstance(coll['id'], long):
                        tables[table_index]['colls'][coll_index]['id'] = get_uuid()
                        colls_with_duplicates = True
                    elif isinstance(coll['id'], int):
                        tables[table_index]['colls'][coll_index]['id'] = str(coll['id'])
                        colls_with_duplicates = True
                    else:
                        colls_ids.append(coll['id'])

                    if coll['categories']:
                        for category_index, category in enumerate(coll['categories']):
                            if category['id'] in categories_ids or isinstance(category['id'], long):
                                tables[table_index]['colls'][coll_index]['categories'][category_index]['id'] = get_uuid()
                                categories_with_duplicates = True
                            elif isinstance(category['id'], int):
                                tables[table_index]['colls'][coll_index]['categories'][category_index]['id'] = str(category['id'])
                                categories_with_duplicates = True
                            else:
                                categories_ids.append(category['id'])

                            if category['links']:
                                for link_index, link in enumerate(category['links']):
                                    if link['id'] in links_ids or isinstance(link['id'], long):
                                        tables[table_index]['colls'][coll_index]['categories'][category_index]['links'][link_index]['id'] = get_uuid()
                                        links_with_duplicates = True
                                    elif isinstance(link['id'], int):
                                        tables[table_index]['colls'][coll_index]['categories'][category_index]['links'][link_index]['id'] = str(link['id'])
                                        links_with_duplicates = True
                                    else:
                                        links_ids.append(link['id'])
            if tables_with_duplicates or colls_with_duplicates or categories_with_duplicates or links_with_duplicates:
                print('WITH DUPLICATES!!!')
                script.replace_table(tables[table_index], table_index)
        print('------------------------')
        print(gc.collect())
        time.sleep(0.1)
