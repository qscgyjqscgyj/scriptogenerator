# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model

from scripts.celery import app
import time

EXCLUDE_RELATION_FIELDS = ['parent', 'to_link']


@app.task
def cloneTreeRelations(mainObject_pk, cloneObject_pk, app_name, model_name, recursive_iteration=1):
    if recursive_iteration < 10:
        model = get_model(app_name, model_name)
        mainObject = model.objects.get(pk=mainObject_pk)
        try:
            cloneObject = model.objects.get(pk=cloneObject_pk)
            if hasattr(cloneObject, 'parent'):
                cloneObject.parent = mainObject
                cloneObject.save()

            if hasattr(cloneObject, 'opened'):
                cloneObject.opened = False
                cloneObject.save()

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
        except ObjectDoesNotExist:
            time.sleep(1)
            recursive_iteration += 1
            return cloneTreeRelations.delay(mainObject_pk, cloneObject_pk, app_name, model_name, recursive_iteration)
    else:
        return False


@app.task
def clone_save_links(clone_script_pk, current_script_links_count, recursive_iteration=1):
    recursive_iteration += 1
    if recursive_iteration < 10:
        clone_script = get_model('main', 'Script').objects.get(pk=clone_script_pk)
        clone_links = clone_script.links(parent=True)

        if len(clone_links) < current_script_links_count:
            time.sleep(1)
            print(len(clone_links))
            print(current_script_links_count)
            print('Iteration: ' + str(recursive_iteration))
            print('---------------------')
            clone_save_links.delay(clone_script_pk, current_script_links_count, recursive_iteration)
        else:
            for link in clone_links:
                if link.to_link:
                    print('to_link (' + str(link.pk) + ') script before: ' + str(link.to_link.category.table.table.script.pk))
                    try:
                        to_link = get_model('main', 'Link').objects.get(parent__pk=link.to_link.pk, category__table__table__script__pk=link.category.table.table.script.pk)
                        link.to_link = to_link
                        link.save()
                        print('found')
                        print('to_link (' + str(link.pk) + ') script after: ' + str(link.to_link.category.table.table.script.pk))
                    except ObjectDoesNotExist:
                        print('not found')
                        time.sleep(1)
                        recursive_iteration += 1
                        clone_save_links.delay(clone_script_pk, current_script_links_count, recursive_iteration)
                link.clone_save()
            clone_script.active = True
            return clone_script.save()
    else:
        return False
