from django.shortcuts import render
from django.views.generic import View
from main.views import JSONResponse
import json

from payment.serializers import UserPaymentSerializer


class PaymentView(View):
    def get(self, request, *args, **kwargs):
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
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


class GetPaymentView(View):
    def get(self, request, *args, **kwargs):
        payment = kwargs['pk']
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True, 'payment': payment})
        return JSONResponse({'success': True, 'payment': payment})


class PaymentSuccessView(View):
    def get(self, request, *args, **kwargs):
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})


class PaymentFailView(View):
    def get(self, request, *args, **kwargs):
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})
