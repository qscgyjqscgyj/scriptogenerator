# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from main.views import MainView, ScriptsView, InitView, TablesView, CollsView, LinkCategoriesView, \
    LinkView, ScriptAccessView, CloneScriptView, ExternalRegisterView, DelegateScriptView, ExternalPaymentView, \
    ScriptView
from payment.views import PaymentView
from users.views import TeamView, ProfileView

urlpatterns = patterns('',
    url(r'^$', MainView.as_view(), name='main'),

    # API
    url(r'^api/init/$', login_required(csrf_exempt(InitView.as_view())), name='init'),

    url(r'^api/scripts/$', login_required(csrf_exempt(ScriptsView.as_view())), name='scripts'),
    url(r'^api/scripts/clone$', login_required(csrf_exempt(CloneScriptView.as_view())), name='clone_script'),
    url(r'^api/scripts/delegate$', login_required(csrf_exempt(DelegateScriptView.as_view())), name='delegate_script'),
    url(r'^api/script/$', login_required(csrf_exempt(ScriptView.as_view())), name='script'),
    url(r'^api/accesses/$', login_required(csrf_exempt(ScriptAccessView.as_view())), name='accesses'),

    url(r'^api/tables/$', login_required(csrf_exempt(TablesView.as_view())), name='tables'),
    url(r'^api/colls/$', login_required(csrf_exempt(CollsView.as_view())), name='colls'),

    url(r'^api/links/$', login_required(csrf_exempt(LinkView.as_view())), name='links'),
    url(r'^api/links/categories/$', login_required(csrf_exempt(LinkCategoriesView.as_view())), name='link_categories'),

    url(r'^api/profile/$', login_required(csrf_exempt(ProfileView.as_view())), name='profile'),
    url(r'^api/payment/$', login_required(csrf_exempt(PaymentView.as_view())), name='payment'),
    url(r'^api/team/$', login_required(csrf_exempt(TeamView.as_view())), name='team'),

    url(r'^api/ext.register$', ExternalRegisterView.as_view(), name='ext.register'),
    url(r'^api/ext.payment$', ExternalPaymentView.as_view(), name='ext.payment'),

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
