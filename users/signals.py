# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate, login

from main.events import take_presents_to_user


def user_created(sender, user, request, **kwargs):
    take_presents_to_user(user)
    user.is_active = True
    user.save()
    return login(request, authenticate(
        username=user.username,
        password=request.POST['password1']
    ))
