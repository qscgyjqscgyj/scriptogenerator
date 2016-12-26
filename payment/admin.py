from django.contrib import admin
from payment.models import *


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'payed')


admin.site.register(Balance)
admin.site.register(Bonus)
admin.site.register(UserPayment, UserPaymentAdmin)
admin.site.register(LocalPayment)

