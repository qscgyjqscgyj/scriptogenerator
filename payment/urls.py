# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.views.decorators.csrf import csrf_exempt

from payment.views import PaymentFailView, YandexPaymentView, PaymentForUserAccesses, PaymentForScriptDelegation, \
    PaymentForOfflineScript, PaymentForUnlimitedOfflineScript, PaymentForUserAccessesWithSale
from payment.views import PaymentSuccessView

urlpatterns = patterns('',
    url(r'^success/$', csrf_exempt(PaymentSuccessView.as_view()), name='payment_success'),
    url(r'^fail/$', csrf_exempt(PaymentFailView.as_view()), name='payment_fail'),
    url(r'^$', csrf_exempt(YandexPaymentView.as_view()), name='yandex_payment'),

    # GETPROFF EXTERNAL PAYMENTS
    url(r'^getproff/pay.user/$', PaymentForUserAccesses.as_view(), name='getproff__pay.user'),
    url(r'^getproff/pay.user.sale/$', PaymentForUserAccessesWithSale.as_view(), name='getproff__pay.user.sale'),
    url(r'^getproff/delegate.script/$', PaymentForScriptDelegation.as_view(), name='getproff__delegate.script'),
    url(r'^getproff/export.script/$', PaymentForOfflineScript.as_view(), name='getproff__export.script'),
    url(r'^getproff/export.script.unlim/$', PaymentForUnlimitedOfflineScript.as_view(), name='getproff__export.script.unlim'),
)
