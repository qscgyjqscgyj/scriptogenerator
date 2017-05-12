# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from offline.views import OfflineScriptView

urlpatterns = patterns('',
    url(r'^(?P<script>\d+)/$', OfflineScriptView.as_view(), name='offline_script'),

    # REACT ROUTES
    url(r'^tables/(?P<script>\d+)/$', OfflineScriptView.as_view(), name='react__offline__script'),
    url(r'^tables/(?P<script>\d+)/table/(?P<table>\d+)/$', OfflineScriptView.as_view(), name='react__offline__table'),
    url(r'^tables/(?P<script>\d+)/table/(?P<table>\d+)/link/(?P<link>\d+)/$', OfflineScriptView.as_view(), name='react__offline__link'),
)
