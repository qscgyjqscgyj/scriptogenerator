# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from main.views import MainView, ScriptsView, ProjectsView

urlpatterns = patterns('',
    url(r'^$', MainView.as_view(), name='main'),
    url(r'^scripts/$', login_required(csrf_exempt(ScriptsView.as_view())), name='scripts'),
    url(r'^projects/$', login_required(csrf_exempt(ProjectsView.as_view())), name='projects'),
)
