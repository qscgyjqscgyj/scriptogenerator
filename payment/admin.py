from django.contrib import admin
from payment.models import *


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'payed', 'payment_data', 'total_sum', 'sum')


admin.site.register(UserPayment, UserPaymentAdmin)
admin.site.register(LocalPayment)

