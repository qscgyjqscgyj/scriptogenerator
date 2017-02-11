from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import CustomUser, UserAccess


class CustomUserAdmin(UserAdmin):
    search_fields = ('username', 'email')
    list_display = ('email', 'last_name', 'first_name', 'phone', 'date_joined', 'balance_total', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        (None, {
            'fields': ('middle_name', 'balance_real', 'balance_total', 'utm', 'cloning_tasks')}
        ),
    )


class UserAccessAdmin(admin.ModelAdmin):
    list_display = ('owner', 'user', 'payed', 'active')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserAccess, UserAccessAdmin)
