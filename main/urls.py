# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from main.views import MainView, ScriptsView

urlpatterns = patterns('',
    url(r'^$', MainView.as_view(), name='main'),
    # url(r'^scripts/$', ScriptsView.as_view(), name='scripts'),
    url(r'^scripts/$', ScriptsView.as_view(), name='scripts'),
)
