# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import get_current_site
from registration.models import RegistrationProfile

from main.tasks import send_new_user_data_email
from users.models import CustomUser
from django.db import IntegrityError


def create_active_user(request, email, last_name='', first_name='', middle_name='', phone=''):
    try:
        user = CustomUser.objects.create(
            username=email,
            email=email,
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            phone=phone
        )
        password = CustomUser.objects.make_random_password(length=10)
        user.set_password(password)
        user.save()
    except IntegrityError:
        return False

    new_user = RegistrationProfile.objects.create_inactive_user(
        new_user=user,
        site=get_current_site(request),
        request=request,
        send_email=False
    )
    new_user.is_active = True
    new_user.save()
    send_new_user_data_email.delay(email, password)
    return {'user': new_user, 'password': password}
