# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.views.decorators.csrf import csrf_exempt

from payment.views import GetPaymentView, PaymentFailView, YandexPaymentView
from payment.views import PaymentSuccessView

urlpatterns = patterns('',
    url(r'^(?P<pk>\d+)/$', csrf_exempt(GetPaymentView.as_view()), name='get_payment'),
    url(r'^success/$', csrf_exempt(PaymentSuccessView.as_view()), name='payment_success'),
    url(r'^fail/$', csrf_exempt(PaymentFailView.as_view()), name='payment_fail'),
    url(r'^$', csrf_exempt(YandexPaymentView.as_view()), name='yandex_payment'),
)
