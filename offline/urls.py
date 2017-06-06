# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


from offline.views import OfflineScriptExportView, OfflineExportedScripts, OfflineVersionScriptViewingView

urlpatterns = patterns('',
    url(r'^(?P<offline_script_export>\d+)/$', login_required(csrf_exempt(OfflineScriptExportView.as_view())), name='offline_script'),
    url(r'^viewing/(?P<script>\d+)/$', login_required(csrf_exempt(OfflineVersionScriptViewingView.as_view())), name='offline_script_version_viewing'),
    url(r'^exported/scripts/$', login_required(csrf_exempt(OfflineExportedScripts.as_view())), name='offline_exported_scripts'),
    #
    # # REACT ROUTES
    # url(r'^tables/(?P<script>\d+)/$', OfflineScriptExportView.as_view(), name='react__offline__script'),
    # url(r'^tables/(?P<script>\d+)/table/(?P<table>\d+)/$', OfflineScriptExportView.as_view(), name='react__offline__table'),
    # url(r'^tables/(?P<script>\d+)/table/(?P<table>\d+)/link/(?P<link>\d+)/$', OfflineScriptExportView.as_view(), name='react__offline__link'),
)
