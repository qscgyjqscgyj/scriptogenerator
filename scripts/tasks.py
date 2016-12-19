# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model

from main.models import Link, Script
from scripts.celery import app
import time

EXCLUDE_RELATION_FIELDS = ['parent', 'to_link']


@app.task
def cloneTreeRelations(mainObject_pk, cloneObject_pk, app_name, model_name, recursive_iteration=1, no_relations=False):
    if recursive_iteration < 100:
        model = get_model(app_name, model_name)
        mainObject = model.objects.get(pk=mainObject_pk)

        try:
            cloneObject = model.objects.get(pk=cloneObject_pk)
        except ObjectDoesNotExist:
            time.sleep(1)
            recursive_iteration += 1
            return cloneTreeRelations.delay(mainObject_pk, cloneObject_pk, app_name, model_name, recursive_iteration)

        if hasattr(cloneObject, 'parent'):
            cloneObject.parent = mainObject
            cloneObject.save()

        if hasattr(cloneObject, 'opened'):
            cloneObject.opened = False
            cloneObject.save()

        if not no_relations:
            relations = type(mainObject)._meta.get_all_related_objects_with_model()

            for relate in relations:
                if relate[0].field.name in EXCLUDE_RELATION_FIELDS:
                    continue
                else:
                    if relate[0].field.model == get_model('main', 'ScriptAccess'):
                        continue
                    else:
                        for relatedObject in relate[0].field.model.objects.filter(**{relate[0].field.name: mainObject}):
                            currentRelatedObject = relatedObject.__class__.objects.get(pk=relatedObject.pk)
                            cloneRelatedObject = relatedObject
                            cloneRelatedObject.id = None
                            setattr(cloneRelatedObject, relate[0].field.name, cloneObject)
                            cloneRelatedObject.save()
                            if type(currentRelatedObject)._meta.get_all_related_objects_with_model():
                                cloneTreeRelations.delay(currentRelatedObject.pk, cloneRelatedObject.pk, type(currentRelatedObject)._meta.app_label, currentRelatedObject.__class__.__name__)

        # IF THE LINK OBJECT
        if cloneObject.__class__.__name__ == 'Link':
            if cloneObject.to_link:
                print('to_link')
                try:
                    to_link = cloneObject.__class__.objects.get(parent__pk=cloneObject.to_link.pk,
                                                                category__table__table__script__pk=cloneObject.category.table.table.script.pk)
                    cloneObject.to_link = to_link
                    cloneObject.save()
                    print('fount')
                except ObjectDoesNotExist:
                    print('not fount')
                    time.sleep(1)
                    recursive_iteration += 1
                    return cloneTreeRelations.delay(mainObject_pk, cloneObject_pk, app_name, model_name, recursive_iteration, True)
    else:
        return False


@app.task
def clone_save_links(clone_script_pk, current_script_links_count, recursive_iteration=1):
    recursive_iteration += 1
    if recursive_iteration < 100:
        clone_script = Script.objects.get(pk=clone_script_pk)
        clone_links = clone_script.links(parent=True)

        while len(clone_links) < current_script_links_count:
            time.sleep(1)
            print(len(clone_links))
            print(current_script_links_count)
            print('Iteration: ' + str(recursive_iteration))
            print('---------------------')
            return clone_save_links.delay(clone_script_pk, current_script_links_count, recursive_iteration)

        for link in clone_links:
            link.clone_save()
        clone_script.active = True
        return clone_script.save()
    else:
        return False
