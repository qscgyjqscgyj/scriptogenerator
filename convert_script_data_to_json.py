# -*- coding: utf-8 -*-
import json

from main.models import Script
import time
import datetime


def current_milli_time():
    return int(round(time.time() * 1000))


def get_empty_table():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': 'Новая таблица',
        'text_coll_name': 'Блок с текстом',
        'text_coll_size': 50,
        'text_coll_position': 0,
        'date': datetime.datetime.now(),
        'date_mod': datetime.datetime.now(),
        'colls': []
    }


def get_empty_coll():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': 'Новый блок',
        'size': 100,
        'position': 1,
        'categories': []
    }


def get_empty_category():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': 'Новая категория',
        'hidden': False,
        'order': 1,
        'opened': False,
        'links': []
    }


def get_empty_link():
    return {
        'id': current_milli_time(),
        'old_id': None,
        'name': 'Новая ссылка',
        'to_link': None,
        'text': None,
        'order': 1,
        'opened': False,
    }


def new_object(object, empty_object):
    for attr in dir(object):
        if attr in empty_object.keys() and not callable(getattr(object, attr)):
            if type(getattr(object, attr)) is datetime.datetime:
                empty_object[attr] = getattr(object, attr).isoformat()
            elif attr == 'id':
                empty_object['old_id'] = getattr(object, attr)
            elif attr == 'to_link':
                to_link = getattr(object, attr)
                empty_object['to_link'] = {'attr': 'old_id', 'id': to_link.pk} if to_link else to_link
            else:
                empty_object[attr] = getattr(object, attr)
    return empty_object


def convert():
    scripts = Script.objects.all()
    for i, script in enumerate(scripts):
        data = []
        for table in script.tables():
            converted_table = new_object(table, get_empty_table())
            for coll in table.colls():
                converted_coll = new_object(coll, get_empty_coll())
                for category in coll.categories():
                    converted_category = new_object(category, get_empty_category())
                    for link in category.links():
                        converted_link = new_object(link, get_empty_link())
                        converted_category['links'].append(converted_link)
                    converted_coll['categories'].append(converted_category)
                converted_table['colls'].append(converted_coll)
            data.append(converted_table)
        script.data = json.dumps(data)
        script.save()
        print('Done: %s/%s' % (str(i + 1), str(len(scripts))))

# '''
# SCRIPT DATA SCHEMA
# [
#     {
#         id: current_milli_time(),
#         name: 'Table name',
#         text_coll_name: 'Name of the text column',
#         text_coll_size: 100 (%),
#         text_coll_position: 1 (0, 1, 2 ...),
#         date: Created datetime,
#         date_mod: Mode datetime,
#         colls: [
#             {
#                 id: current_milli_time(),
#                 name: 'Coll name',
#                 size: 100 (%),
#                 position: 1 (0, 1, 2 ...),
#                 categories: [
#                     {
#                         id: current_milli_time(),
#                         name: 'Link category name',
#                         hidden: True/False,
#                         order: 1 (0, 1, 2 ...),
#                         opened: True/False,
#                         links: [
#                             {
#                                 id: current_milli_time(),
#                                 name: 'Link name',
#                                 to_link: Another table link id (should be: current_milli_time()),
#                                 text: Draft.js json data,
#                                 order: 1 (0, 1, 2 ...),
#                                 opened: True/False,
#                             },
#                         ],
#                     },
#                 ],
#             },
#         ],
#     }
# ]
# '''
