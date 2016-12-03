# # -*- coding: utf-8 -*-
# from django.db.models.loading import get_model
# from django.core import serializers
# from django.core.exceptions import ObjectDoesNotExist
#
# import json
# import urllib
#
#
# def getAllRelations(object_pk, app_name, model_name):
#     object = get_model(app_name, model_name).objects.get(pk=object_pk)
#     resultRelations = [object]
#     def getThree(object):
#         relations = type(object)._meta.get_all_related_objects_with_model()
#         for relate in relations:
#             for relatedObject in relate[0].model.objects.filter(**{relate[0].field.name: object}):
#                 currentRelatedObject = relatedObject.__class__.objects.get(pk=relatedObject.pk)
#                 resultRelations.append(currentRelatedObject)
#                 if type(currentRelatedObject)._meta.get_all_related_objects_with_model():
#                     getThree(currentRelatedObject)
#         return resultRelations
#     return getThree(object)
#
#
# EXCLUDE_RELATION_FIELDS = ['parent', 'to_link']
#
#
# def cloneTreeRelations(mainObject_pk, cloneObject_pk, app_name, model_name):
#     model = get_model(app_name, model_name)
#     mainObject = model.objects.get(pk=mainObject_pk)
#     cloneObject = None
#     while not cloneObject:
#         try:
#             cloneObject = model.objects.get(pk=cloneObject_pk)
#         except ObjectDoesNotExist:
#             cloneObject = None
#
#     if hasattr(cloneObject, 'parent'):
#         cloneObject.parent = mainObject
#         cloneObject.save()
#
#     if hasattr(cloneObject, 'to_link'):
#         if cloneObject.to_link:
#             try:
#                 cloneObject.to_link = cloneObject.__class__.objects.get(parent__pk=cloneObject.to_link.pk)
#                 cloneObject.save()
#             except ObjectDoesNotExist:
#                 pass
#
#     relations = type(mainObject)._meta.get_all_related_objects_with_model()
#
#     for relate in relations:
#         if relate[0].field.name in EXCLUDE_RELATION_FIELDS:
#             continue
#         else:
#             if relate[0].field.model == get_model('main', 'ScriptAccess'):
#                 continue
#             else:
#                 for relatedObject in relate[0].field.model.objects.filter(**{relate[0].field.name: mainObject}):
#                     currentRelatedObject = relatedObject.__class__.objects.get(pk=relatedObject.pk)
#                     cloneRelatedObject = relatedObject
#                     cloneRelatedObject.id = None
#                     setattr(cloneRelatedObject, relate[0].field.name, cloneObject)
#                     cloneRelatedObject.save()
#                     if type(currentRelatedObject)._meta.get_all_related_objects_with_model():
#                         cloneTreeRelations(currentRelatedObject.pk, cloneRelatedObject.pk, type(currentRelatedObject)._meta.app_label, currentRelatedObject.__class__.__name__)
