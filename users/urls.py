# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from users.views import UserProfileView, CustomRegistrationView

urlpatterns = patterns('',
    # url(r'^profile/', login_required(UserProfileView.as_view()), name='profile'),
    url(r'^register/$', CustomRegistrationView.as_view(), name='registration_register'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
)
