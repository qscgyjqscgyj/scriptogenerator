from django.shortcuts import render
from django.views.generic import View
from main.views import JSONResponse
import json

from payment.models import UserPayment
from payment.serializers import UserPaymentSerializer
from django.core.mail import send_mail


class PaymentView(View):
    def get(self, request, *args, **kwargs):
        send_mail('PaymentView.post', str(request.GET), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})

    def post(self, request, *args, **kwargs):
        send_mail('PaymentView.post', str(request.POST), 'info@scriptogenerator.ru', ['aliestarten@gmail.com'])
        data = json.loads(request.body)
        data['user'] = request.user.pk
        payment = UserPaymentSerializer(data=data)
        if payment.is_valid():
            payment = payment.create(data)
            return JSONResponse({
                'payment': UserPaymentSerializer(payment).data
            })
        return JSONResponse(payment.errors, status=400)


class GetPaymentView(View):
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
