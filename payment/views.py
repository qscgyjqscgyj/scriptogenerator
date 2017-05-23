# -*- coding: utf-8 -*-
import datetime
import urllib

import pytz
from constance import config
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.template import loader
from django.views.generic import View
from main.views import JSONResponse
import json
import hashlib
from dateutil.tz import tzlocal

from payment.models import UserPayment, UserScriptDelegationAccess, UserOfflineScriptExportAccess
from payment.serializers import UserPaymentSerializer
from django.core.mail import send_mail

from payment.tasks import recount_balance
from scripts.settings import YANDEX_SHOPID, YANDEX_SHOPPASSWORD
from users.models import CustomUser


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
        # send_mail('YandexPaymentView.get', str(dict(request.GET)), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        mode = request.GET.get('mode')
        if mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})

    def post(self, request, *args, **kwargs):
        # send_mail('YandexPaymentView.post', str(dict(request.POST)), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        action = request.POST.get('action')
        yandex_md5 = request.POST.get('md5')
        date = datetime.datetime.now(tzlocal()).isoformat()
        response_template = loader.get_template('payment_response.xml')
        if yandex_md5:
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

            def success(aviso=False):
                response = {
                    'code': 0,
                    'performedDatetime': date,
                    'shopId': int(request.POST.get('shopId')),
                    'invoiceId': int(request.POST.get('invoiceId')),
                    'orderSumAmount': request.POST.get('orderSumCurrencyPaycash'),
                    'aviso': aviso
                }
                return HttpResponse(response_template.render(response, request), content_type='application/xhtml+xml')

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
                # send_mail('YandexPaymentView.post md5 error response', str(response), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
                return HttpResponse(response_template.render(response, request), content_type='application/xhtml+xml')

            if md5.hexdigest().upper() != yandex_md5:
                return error()

            if action == 'checkOrder':
                return success()

            elif action == 'cancelOrder':
                return success()

            elif action == 'paymentAviso':
                if md5.hexdigest().upper() == yandex_md5:
                    payment = UserPayment.objects.get(pk=int(request.POST.get('orderNumber')))
                    payment.payed = datetime.datetime.today()
                    payment.payment_data = json.dumps(dict(request.POST))
                    payment.save()
                    return success(aviso=True)
            return error()
        else:
            response = {
                'code': 100,
                'performedDatetime': date,
                'shopId': YANDEX_SHOPID,
                'invoiceId': '',
                'orderSumAmount': '',
                'message': 'Нет данные об оплате',
                'techMessage': 'Payment data does not found.'
            }
            return HttpResponse(response_template.render(response, request), content_type='application/xhtml+xml')


class PaymentSuccessView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponseRedirect(reverse('main'))


class PaymentFailView(View):
    def get(self, request, *args, **kwargs):
        # send_mail('PaymentFailView.get', str(dict(request.GET)), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})


class GetproffExternalPayment:
    PRODUCT_ID = None

    def get_positions(self, positions):
        if ' x ' in positions and self.PRODUCT_ID in positions:
            return positions.split(' x ')[0]
        return positions

    def get_products_count(self, positions):
        if ' x ' in positions and self.PRODUCT_ID in positions:
            return int(positions.split(' x ')[1])
        return 1

    def get_multiplier(self, positions):
        splited_positions = self.get_positions(positions).split(self.PRODUCT_ID)
        return 1 if (len(splited_positions) == 2 and splited_positions[1] == '') else int(splited_positions[1][1:])


# data examples:
# {u'positions': [u'pay.user.6 x 7'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
# {u'positions': [u'pay.user'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
class PaymentForUserAccesses(View, GetproffExternalPayment):
    PRODUCT_ID = 'pay.user'

    def get(self, request, *args, **kwargs):
        positions = request.GET.get('positions')
        email = request.GET.get('email')
        if email:
            if positions and self.PRODUCT_ID in positions:
                users_multiplier = self.get_multiplier(positions)
                months_multiplier = self.get_products_count(positions)
                payment_sum = config.PAYMENT_PER_USER * users_multiplier * months_multiplier
                payment = UserPayment(
                    name='Пополнение счета. Пользователей: %(product_multiplier)s, месяцев: %(months_multiplier)s' % dict(
                        product_multiplier=str(users_multiplier),
                        months_multiplier=str(months_multiplier)
                    ),
                    user=CustomUser.objects.get(username=email),
                    sum=payment_sum,
                    total_sum=payment_sum,
                    payed=datetime.datetime.now()
                )
                payment.save()
                return JSONResponse({'status': 'success'}, status=200)
            return JSONResponse({'status': 'error', 'message': 'Positions does not support with this method'}, status=500)
        return JSONResponse({'status': 'error', 'message': 'Email is required'}, status=500)


# data examples
# {u'positions': [u'delegate.script x 8'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
# {u'positions': [u'delegate.script'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
class PaymentForScriptDelegation(View, GetproffExternalPayment):
    PRODUCT_ID = 'delegate.script'

    def get(self, request, *args, **kwargs):
        positions = request.GET.get('positions')
        email = request.GET.get('email')
        if email:
            if positions and self.PRODUCT_ID in positions:
                products_count = self.get_products_count(positions)
                for i in range(products_count):
                    UserScriptDelegationAccess.objects.create(
                        user=CustomUser.objects.get(username=email),
                        payed=datetime.datetime.now()
                    )
                return JSONResponse({'status': 'success'}, status=200)
            return JSONResponse({'status': 'error', 'message': 'Positions does not support with this method'}, status=500)
        return JSONResponse({'status': 'error', 'message': 'Email is required'}, status=500)


# data examples
# {u'positions': [u'export.script x 5'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
# {u'positions': [u'export.script'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
class PaymentForOfflineScript(View, GetproffExternalPayment):
    PRODUCT_ID = 'export.script'

    def get(self, request, *args, **kwargs):
        positions = request.GET.get('positions')
        email = request.GET.get('email')
        if email:
            if positions and self.PRODUCT_ID in positions:
                products_count = self.get_products_count(positions)
                for i in range(products_count):
                    UserOfflineScriptExportAccess.objects.create(
                        user=CustomUser.objects.get(username=email),
                        payed=datetime.datetime.now()
                    )
                return JSONResponse({'status': 'success'}, status=200)
            return JSONResponse({'status': 'error', 'message': 'Positions does not support with this method'}, status=500)
        return JSONResponse({'status': 'error', 'message': 'Email is required'}, status=500)


# data examples
# {u'positions': [u'export.script.unlim.12'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
# {u'positions': [u'export.script.unlim'], u'type': [u'ext'], u'email': [u'sky-life@inbox.ru']}
class PaymentForUnlimitedOfflineScript(View, GetproffExternalPayment):
    PRODUCT_ID = 'export.script.unlim'

    def get(self, request, *args, **kwargs):
        positions = request.GET.get('positions')
        email = request.GET.get('email')
        if email:
            if positions and self.PRODUCT_ID in positions:
                months = self.get_multiplier(positions)
                UserOfflineScriptExportAccess.objects.create(
                    user=CustomUser.objects.get(username=email),
                    payed=datetime.datetime.now(),
                    unlim_months=months
                )
                return JSONResponse({'status': 'success'}, status=200)
            return JSONResponse({'status': 'error', 'message': 'Positions does not support with this method'}, status=500)
        return JSONResponse({'status': 'error', 'message': 'Email is required'}, status=500)
