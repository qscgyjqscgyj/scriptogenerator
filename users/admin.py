from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import CustomUser, UserAccess


class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'last_name', 'first_name', 'middle_name', 'balance_real', 'balance_total', 'is_active')
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')}
        ),
    )


class UserAccessAdmin(admin.ModelAdmin):
    list_display = ('owner', 'user', 'payed', 'active')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserAccess, UserAccessAdmin)
