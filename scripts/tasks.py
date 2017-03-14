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
    clone_script.active = True
    return clone_script.save()

