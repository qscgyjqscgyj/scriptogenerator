from django.contrib import admin
from payment.models import *


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'payed', 'payment_data', 'total_sum', 'sum')


class LocalPaymentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'sum', 'date')


admin.site.register(UserPayment, UserPaymentAdmin)
admin.site.register(LocalPayment, LocalPaymentAdmin)
