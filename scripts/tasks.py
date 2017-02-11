# -*- coding: utf-8 -*-
from copy import deepcopy
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models.loading import get_model

from scripts.celery import app
import time

EXCLUDE_RELATION_FIELDS = ['parent', 'to_link']


@app.task
@transaction.atomic
def clone_script_with_relations(script_pk, clone_script_values=[]):
    """
    :param script_pk - if of cloning script:
    :param clone_script_values - defferent values for new script. Format: [('key', value), ...]:
    """
    current_script = get_model('main', 'Script').objects.get(pk=script_pk)

    clone_script = deepcopy(current_script)
    for value in clone_script_values:
        clone_script.__setattr__(value[0], value[1])
    clone_script.pk = None
    clone_script.is_template = False
    clone_script.is_present = False
    clone_script.parent = current_script
    clone_script.save()

    clone_links = []

    for current_table in get_model('main', 'Table').objects.filter(script=current_script):
        clone_table = deepcopy(current_table)
        clone_table.pk = None
        clone_table.script = clone_script
        clone_table.parent = current_table
        clone_table.save()
        for current_coll in get_model('main', 'TableLinksColl').objects.filter(table=current_table):
            clone_coll = deepcopy(current_coll)
            clone_coll.pk = None
            clone_coll.table = clone_table
            clone_coll.save()
            for current_category in get_model('main', 'LinkCategory').objects.filter(table=current_coll):
                clone_category = deepcopy(current_category)
                clone_category.pk = None
                clone_category.table = clone_coll
                clone_category.save()
                for current_link in get_model('main', 'Link').objects.filter(category=current_category):
                    clone_link = deepcopy(current_link)
                    clone_link.pk = None
                    clone_link.category = clone_category
                    clone_link.parent = current_link

                    if clone_link.to_link:
                        to_link = get_model('main', 'Link').objects.get(parent__pk=clone_link.to_link.pk, category__table__table__script__pk=clone_link.category.table.table.script.pk)
                        clone_link.to_link = to_link
                    clone_link.clone_save()
                    clone_links.append(clone_link)

    clone_script.active = True
    return clone_script.save()
