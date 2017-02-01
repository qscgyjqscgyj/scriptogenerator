# -*- coding: utf-8 -*-
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


# def duplicate(obj, value, field):
#     """
#     Duplicate all related objects of `obj` setting
#     `field` to `value`. If one of the duplicate
#     objects has an FK to another duplicate object
#     update that as well. Return the duplicate copy
#     of `obj`.
#     """
#     collected_objs = NestedObjects(using='default')
#     obj._collect_sub_objects(collected_objs)
#     related_models = collected_objs.keys()
#     root_obj = None
#     # Traverse the related models in reverse deletion order.
#     for model in reversed(related_models):
#         # Find all FKs on `model` that point to a `related_model`.
#         fks = []
#         for f in model._meta.fields:
#             if isinstance(f, ForeignKey) and f.rel.to in related_models:
#                 fks.append(f)
#         # Replace each `sub_obj` with a duplicate.
#         sub_obj = collected_objs[model]
#         for pk_val, obj in sub_obj.iteritems():
#             for fk in fks:
#                 fk_value = getattr(obj, "%s_id" % fk.name)
#                 # If this FK has been duplicated then point to the duplicate.
#                 if fk_value in collected_objs[fk.rel.to]:
#                     dupe_obj = collected_objs[fk.rel.to][fk_value]
#                     setattr(obj, fk.name, dupe_obj)
#             # Duplicate the object and save it.
#             obj.id = None
#             setattr(obj, field, value)
#             obj.save()
#             if root_obj is None:
#                 root_obj = obj
#     return root_objn n