# -*- coding: utf-8 -*-
import json

import datetime

from django.db import transaction

from main.models import Script, Table, TableLinksColl, LinkCategory, Link, ScriptData
from main.utils import get_empty_table, get_empty_coll, get_empty_category, get_empty_link


def new_object(object, empty_object):
    for attr in dir(object):
        if attr in empty_object.keys() and not callable(getattr(object, attr)):
            if type(getattr(object, attr)) is datetime.datetime:
                empty_object[attr] = getattr(object, attr).isoformat()
            elif attr == 'to_link':
                to_link = getattr(object, attr)
                empty_object['to_link'] = to_link.pk if to_link else None
            elif attr == 'text' and getattr(object, attr):
                try:
                    text = json.loads(getattr(object, attr))
                    if text.get('entityMap'):
                        for key, value in text.get('entityMap').items():
                            if value['type'] == 'LINK' and '/table/' in value['data']['url'] and '/tables/' in value['data']['url']:
                                value['data']['url'] = value['data']['url'].replace('https://scriptogenerator.ru/#', '')
                                value['data']['url'] = value['data']['url'].replace('https://scriptogenerator.ru', '')
                                value['data']['url'] = value['data']['url'].replace('/#/', '/')
                                fixed_url = '/' + '/'.join(value['data']['url'].split('/')[3:])
                                text['entityMap'][str(key)]['data']['url'] = fixed_url
                    empty_object[attr] = json.dumps(text)
                except ValueError:
                    pass
            else:
                empty_object[attr] = getattr(object, attr)
    return empty_object


def convert():
    scripts = Script.objects.all()
    for i, script in enumerate(scripts):
        script_data, created = ScriptData.objects.get_or_create(script=script)
        data = []
        for table in Table.objects.filter(script=script):
            converted_table = new_object(table, get_empty_table())
            for coll in TableLinksColl.objects.filter(table=table):
                converted_coll = new_object(coll, get_empty_coll())
                for category in LinkCategory.objects.filter(table=coll):
                    converted_category = new_object(category, get_empty_category())
                    for link in Link.objects.filter(category=category):
                        converted_link = new_object(link, get_empty_link())
                        converted_category['links'].append(converted_link)
                    converted_coll['categories'].append(converted_category)
                converted_table['colls'].append(converted_coll)
            data.append(converted_table)
            script_data.data = json.dumps(data)
        if data:
            script_data.save()
        print('Done: %s/%s - %s' % (str(i + 1), str(len(scripts)), str(script.id)))


def fix_tables():
    scripts = Script.objects.all()
    for script_index, script in enumerate(scripts):
        try:
            script_data = ScriptData.objects.get(script=script)
            data = json.loads(script_data.data)
            if data:
                for table_index, table in enumerate(data):
                    for coll_index, coll in enumerate(table['colls']):
                        for category_index, category in enumerate(coll['categories']):
                            for link_index, link in enumerate(category['links']):
                                if link['text']:
                                    text = json.loads(link['text'])
                                    if text and text.get('entityMap'):
                                        for key, value in text.get('entityMap').items():
                                            if value['type'] == 'LINK' and '/table/' in value['data']['url'] and '/tables/' in value['data']['url']:
                                                value['data']['url'] = value['data']['url'].replace('https://scriptogenerator.ru/#', '')
                                                value['data']['url'] = value['data']['url'].replace('https://scriptogenerator.ru', '')
                                                value['data']['url'] = value['data']['url'].replace('/#/', '/')
                                                fixed_url = '/' + '/'.join(value['data']['url'].split('/')[3:])
                                                text['entityMap'][str(key)]['data']['url'] = fixed_url
                                                try:
                                                    data[table_index]['colls'][coll_index]['categories'][category_index]['links'][link_index]['text'] = json.dumps(text)
                                                except TypeError:
                                                    print('TypeError with script %s' % str(script.id))
                script_data.data = json.dumps(data)
                script_data.save()
            print('Done: %s/%s - %s' % (str(script_index + 1), str(len(scripts)), str(script.id)))
        except ValueError:
            print('ValueError with script %s' % str(script.id))
