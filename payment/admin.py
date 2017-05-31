from django.contrib import admin
from payment.models import *


class UserPaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'payed', 'payment_data', 'total_sum', 'sum')


class LocalPaymentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'sum', 'date')


class PaymentLogAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'debit_credit', 'date')


class UserScriptDelegationAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'delegated', 'payed', 'date')


class UserOfflineScriptExportAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'script', 'exported', 'unlim_months', 'payed', 'date')
    readonly_fields = ('script_data',)


admin.site.register(UserPayment, UserPaymentAdmin)
admin.site.register(LocalPayment, LocalPaymentAdmin)
admin.site.register(PaymentLog, PaymentLogAdmin)
admin.site.register(UserScriptDelegationAccess, UserScriptDelegationAccessAdmin)
admin.site.register(UserOfflineScriptExportAccess, UserOfflineScriptExportAccessAdmin)
