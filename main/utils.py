# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import get_current_site
from registration.models import RegistrationProfile

from main.tasks import send_new_user_data_email
from users.models import CustomUser
from django.db import IntegrityError


