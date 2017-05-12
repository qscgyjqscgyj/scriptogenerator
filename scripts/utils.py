# -*- coding: utf-8 -*-
import datetime
from django.contrib.admin.utils import NestedObjects
from django.db.models.fields.related import ForeignKey


def get_params(url):
    result = {}
    params = url.split("?")[1] if '?' in url else url
    for param in params.split('&'):
        param_splits = param.split('=')
        try:
            result[param_splits[0]] = param_splits[1]
        except IndexError:
            continue
    return result


def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")


def duplicate(instance):
    kwargs = {}
    for field in instance._meta.fields:
        kwargs[field.name] = getattr(instance, field.name)
        # or self.__dict__[field.name]
    kwargs.pop('id')
    new_instance = instance.__class__(**kwargs)
    new_instance.save()
    # now you have id for the new instance so you can
    # create related models in similar fashion
    fkeys_qs = instance.fkeys.all()
    new_fkeys = []
    for fkey in fkeys_qs:
        fkey_kwargs = {}
        for field in fkey._meta.fields:
            fkey_kwargs[field.name] = getattr(fkey, field.name)
        fkey_kwargs.pop('id')
        fkey_kwargs['foreign_key_field'] = new_instance.id
        new_fkeys.append(fkeys_qs.model(**fkey_kwargs))
    fkeys_qs.model.objects.bulk_create(new_fkeys)
    return new_instance