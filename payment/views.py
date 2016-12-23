# -*- coding: utf-8 -*-
import datetime

import pytz
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
        send_mail('YandexPaymentView.post', str(request.POST), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        action = request.POST.get('action')
        mode = request.GET.get('mode')
        yandex_md5 = request.POST.get('md5')
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
        if mode == 'test' and action == 'checkOrder':
            if md5.hexdigest().upper() == yandex_md5:
                response = {
                    'code': 0,
                    'performedDatetime': date,
                    'shopId': int(request.POST.get('shopId')),
                    'invoiceId': int(request.POST.get('invoiceId')),
                    'orderSumAmount': request.POST.get('orderSumCurrencyPaycash'),
                }
                send_mail('YandexPaymentView.post success response', str(response), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
                return JSONResponse(response)
            else:
                response = {
                    'code': 100,
                    'performedDatetime': date,
                    'shopId': int(request.POST.get('shopId')),
                    'invoiceId': int(request.POST.get('invoiceId')),
                    'orderSumAmount': request.POST.get('orderSumCurrencyPaycash'),
                    'message': 'Неверные входные параметры',
                    'techMessage': 'MD5 не совпадают'
                }
                send_mail('YandexPaymentView.post error response', str(response), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
                return JSONResponse(response)
        return JSONResponse({'success': True})


class GetPaymentView(View):
    def get(self, request, *args, **kwargs):
        send_mail('GetPaymentView.get', str(request.GET), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        payment = UserPayment.objects.get(pk=int(kwargs['pk']))
        test_mode = request.GET.get('mode')
        method = request.GET.get('method')
        if test_mode and test_mode == 'test':
            if method == 'checkOrder':
                print('asdasd')
        return JSONResponse({'success': True, 'payment': payment})

    def post(self, request, *args, **kwargs):
        send_mail('GetPaymentView.post', str(request.POST), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        payment = UserPayment.objects.get(pk=int(kwargs['pk']))
        test_mode = request.GET.get('mode')
        method = request.GET.get('method')
        if test_mode and test_mode == 'test':
            if method == 'checkOrder':
                print('asdasd')
        return JSONResponse({'success': True, 'payment': payment})


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
