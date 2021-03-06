# -*- coding: utf-8 -*-
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import CustomUser, UserAccess


class CustomUserAdmin(UserAdmin):
    search_fields = ('username', 'email')
    list_display = (
        'email', 'last_name', 'first_name', 'phone', 'date_joined', 'balance_total', 'team_length', 'last_visit', 'is_active'
    )
    fieldsets = UserAdmin.fieldsets + (
        (None, {
            'fields': ('middle_name', 'balance_real', 'balance_total', 'utm')}
        ),
    )

    actions = ['update_team_lengths']

    def update_team_lengths(self, request, queryset):
        for user in CustomUser.objects.all():
            user.team_length = len(user.team())
            user.save()
    update_team_lengths.short_description = u'Пересчитать команды'


class UserAccessAdmin(admin.ModelAdmin):
    list_display = ('owner', 'user', 'payed')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserAccess, UserAccessAdmin)
