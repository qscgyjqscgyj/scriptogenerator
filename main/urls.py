# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from main.views import MainView, ScriptsView, ProjectsView, InitView, TablesView

urlpatterns = patterns('',
    url(r'^$', MainView.as_view(), name='main'),
    url(r'^init/$', login_required(csrf_exempt(InitView.as_view())), name='init'),
    url(r'^scripts/$', login_required(csrf_exempt(ScriptsView.as_view())), name='scripts'),
    url(r'^projects/$', login_required(csrf_exempt(ProjectsView.as_view())), name='projects'),
    url(r'^tables/$', login_required(csrf_exempt(TablesView.as_view())), name='tables'),
)
