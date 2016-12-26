# -*- coding: utf-8 -*-
import datetime
import urllib

import pytz
from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import View
from main.views import JSONResponse
import json
import hashlib
from dateutil.tz import tzlocal

from payment.models import UserPayment
from payment.serializers import UserPaymentSerializer
from django.core.mail import send_mail

from scripts.settings import YANDEX_SHOPID, YANDEX_SHOPPASSWORD


class PaymentView(View):
    def get(self, request, *args, **kwargs):
        return JSONResponse({'success': True})

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        data['user'] = request.user.pk
        payment = UserPaymentSerializer(data=data)
        if payment.is_valid():
            payment = payment.create(data)
            return JSONResponse({
                'payment': UserPaymentSerializer(payment).data
            })
        return JSONResponse(payment.errors, status=400)


class YandexPaymentView(View):
    def get(self, request, *args, **kwargs):
        send_mail('YandexPaymentView.get', str(request.GET), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        mode = request.GET.get('mode')
        if mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})

    def post(self, request, *args, **kwargs):
        send_mail('YandexPaymentView.post', str(urllib.urlencode(request.POST)), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        action = request.POST.get('action')
        yandex_md5 = request.POST.get('md5')
        if yandex_md5:
            date = datetime.datetime.now(tzlocal()).isoformat()
            md5 = hashlib.md5()
            md5.update('%(action)s;%(order_sum)s;%(orderSumCurrencyPaycash)s;%(orderSumBankPaycash)s;%(shopId)s;%(invoiceId)s;%(customerNumber)s;%(shopPassword)s' % dict(
                action=action,
                order_sum=request.POST.get('orderSumAmount'),
                orderSumCurrencyPaycash=request.POST.get('orderSumCurrencyPaycash'),
                orderSumBankPaycash=request.POST.get('orderSumBankPaycash'),
                shopId=YANDEX_SHOPID,
                invoiceId=request.POST.get('invoiceId'),
                customerNumber=request.POST.get('customerNumber'),
                shopPassword=YANDEX_SHOPPASSWORD
            ))

            def success():
                response = {
                    'code': 0,
                    'performedDatetime': date,
                    'shopId': int(request.POST.get('shopId')),
                    'invoiceId': int(request.POST.get('invoiceId')),
                    'orderSumAmount': request.POST.get('orderSumCurrencyPaycash'),
                }
                return JSONResponse(response)

            def error():
                response = {
                    'code': 1,
                    'performedDatetime': date,
                    'shopId': int(request.POST.get('shopId')),
                    'invoiceId': int(request.POST.get('invoiceId')),
                    'orderSumAmount': request.POST.get('orderSumCurrencyPaycash'),
                    'message': 'Неверные входные параметры',
                    'techMessage': 'MD5 не совпадают'
                }
                send_mail('YandexPaymentView.post md5 error response', str(response), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
                return JSONResponse(response)

            if md5.hexdigest().upper() != yandex_md5:
                return error()

            if action == 'checkOrder':
                return success()

            elif action == 'cancelOrder':
                return success()

            elif action == 'paymentAviso':
                if md5.hexdigest().upper() == yandex_md5:
                    payment = UserPayment.objects.get(pk=id(request.POST.get('orderNumber')))
                    payment.payed = datetime.datetime.now()
                    payment.payment_data = json.dumps(dict(request.POST))
                    payment.save()

                    return success()
            return error()
        return JSONResponse({'error': True, 'message': 'Payment data does not found.'})


class PaymentSuccessView(View):
    def get(self, request, *args, **kwargs):
        send_mail('PaymentSuccessView.get', str(request.GET), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})


class PaymentFailView(View):
    def get(self, request, *args, **kwargs):
        send_mail('PaymentFailView.get', str(request.GET), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})
