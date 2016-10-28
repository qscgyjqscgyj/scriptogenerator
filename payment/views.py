from django.shortcuts import render
from django.views.generic import View

from main.views import JSONResponse


class PaymentView(View):
    def get(self, request, *args, **kwargs):
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True})
        return JSONResponse({'success': True})


class GetPaymentView(View):
    def get(self, request, *args, **kwargs):
        payment = kwargs['pk']
        test_mode = request.GET.get('mode')
        if test_mode and test_mode == 'test':
            return JSONResponse({'success': True, 'test': True, 'payment': payment})
        return JSONResponse({'success': True})


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
