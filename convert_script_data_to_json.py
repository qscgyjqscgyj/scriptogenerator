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
        'name': '',
        'size': 100,
        'position': 1,
        'categories': []
    }


def new_object(object, empty_object):
    for attr in dir(object):
        if attr in empty_object.keys() and not attr == 'id':
            empty_object[attr] = getattr(object, attr)
    return empty_object


def convert():
    scripts = Script.objects.all()
    for i, script in enumerate(scripts):
        print('All scripts: %s' + str(len(scripts)))
        print('Now script: %s' + str(i))
        data = json.loads(script.data)
        if not len(data) > 0:
            tables = script.tables()
            for table in tables:
                converted_table = new_object(table, get_empty_table())
                colls = table.colls()
                for coll in colls:
                    converted_coll = new_object(coll, get_empty_coll())
                    # converted_table['colls'].append(converted_coll)
                    for category in coll.categories():

                data.append(converted_table)


convert()


'''
SCRIPT DATA SCHEMA
[
    {
        id: current_milli_time(),
        name: 'Table name',
        text_coll_name: 'Name of the text column',
        text_coll_size: 100 (%),
        text_coll_position: 1 (0, 1, 2 ...),
        date: Created datetime,
        date_mod: Mode datetime,
        colls: [
            {
                id: current_milli_time(),
                name: 'Coll name',
                size: 100 (%),
                position: 1 (0, 1, 2 ...),
                categories: [
                    {
                        id: current_milli_time(),
                        name: 'Link category name',
                        hidden: True/False,
                        order: 1 (0, 1, 2 ...),
                        opened: True/False,
                        links: [
                            {
                                id: current_milli_time(),
                                name: 'Link name',
                                to_link: Another table link id (should be: current_milli_time()),
                                text: Draft.js json data,
                                order: 1 (0, 1, 2 ...),
                                opened: True/False,
                            },
                        ],
                    },
                ],
            },
        ],
    }
]
'''
