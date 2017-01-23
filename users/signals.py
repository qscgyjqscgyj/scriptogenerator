# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth import authenticate, login
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model

from main.events import take_presents_to_user
from scripts.tasks import cloneTreeRelations, clone_save_links


def user_created(sender, user, request, **kwargs):
    take_presents_to_user(user)
    user.is_active = True
    user.save()
    return login(request, authenticate(
        username=user.username,
        password=request.POST['password1']
    ))
