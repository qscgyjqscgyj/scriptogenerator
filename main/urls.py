# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from main.views import MainView, ScriptsView, ProjectsView, InitView, TablesView, CollsView, LinkCategoriesView, \
    LinkView, ScriptAccessView, CloneScriptView
from users.views import TeamView

urlpatterns = patterns('',
    url(r'^$', MainView.as_view(), name='main'),

    # API
    url(r'^api/init/$', login_required(csrf_exempt(InitView.as_view())), name='init'),

    url(r'^api/scripts/$', login_required(csrf_exempt(ScriptsView.as_view())), name='scripts'),
    url(r'^api/scripts/clone$', login_required(csrf_exempt(CloneScriptView.as_view())), name='clone_script'),
    url(r'^api/projects/$', login_required(csrf_exempt(ProjectsView.as_view())), name='projects'),
    url(r'^api/accesses/$', login_required(csrf_exempt(ScriptAccessView.as_view())), name='accesses'),

    url(r'^api/tables/$', login_required(csrf_exempt(TablesView.as_view())), name='tables'),
    url(r'^api/colls/$', login_required(csrf_exempt(CollsView.as_view())), name='colls'),

    url(r'^api/links/$', login_required(csrf_exempt(LinkView.as_view())), name='links'),
    url(r'^api/links/categories/$', login_required(csrf_exempt(LinkCategoriesView.as_view())), name='link_categories'),

    url(r'^api/team$', login_required(csrf_exempt(TeamView.as_view())), name='team'),

    # REACT ROUTES
    url(r'^projects/$', MainView.as_view(), name='react__projects'),
    url(r'^scripts/user/$', MainView.as_view(), name='react__user_scripts'),
    url(r'^scripts/available/$', MainView.as_view(), name='react__available_scripts'),
    url(r'^tables/(?P<script>\d+)/$', MainView.as_view(), name='react__script'),
    url(r'^tables/(?P<script>\d+)/available/$', MainView.as_view(), name='react__available_script'),

    url(r'^tables/(?P<scripts>\d+)/table/(?P<table>\d+)/edit/$', MainView.as_view(), name='react__table__edit'),
    url(r'^tables/(?P<scripts>\d+)/table/(?P<table>\d+)/share/$', MainView.as_view(), name='react__table__share'),

    url(r'^tables/(?P<scripts>\d+)/table/(?P<table>\d+)/link/(?P<link>\d+)/edit/$', MainView.as_view(), name='react__link__edit'),
    url(r'^tables/(?P<scripts>\d+)/table/(?P<table>\d+)/link/(?P<link>\d+)/share/$', MainView.as_view(), name='react__link__edit'),

    url(r'^profile/$', MainView.as_view(), name='react__profile'),
    url(r'^profile/payment/$', MainView.as_view(), name='react__profile_payment'),
    url(r'^profile/team/$', MainView.as_view(), name='react__profile_team'),
)
