# -*- coding: utf-8 -*-
from django.contrib import admin
from main.models import *


class ScriptAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'active',)
    search_fields = ('owner__email',)
    list_filter = ('active',)


class DeletedScriptAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'date')
    search_fields = ('owner__email',)
    readonly_fields = ('data',)

    actions = ['restore_deleted_scripts']

    def restore_deleted_scripts(self, request, queryset):
        for deleted_script in queryset:
            restored_script = Script.objects.create(
                name=deleted_script.name,
                owner=deleted_script.owner
            )
            ScriptData.objects.create(
                script=restored_script,
                data=deleted_script.data
            )
            deleted_script.delete()
    restore_deleted_scripts.short_description = u'Восстановить удаленные скрипты'


class ScriptDataAdmin(admin.ModelAdmin):
    list_display = ('script',)
    readonly_fields = ('data',)
    search_fields = ('script__pk',)


class TableAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')


class LinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'to_link', 'category', 'parent')


class ScriptAccessAdmin(admin.ModelAdmin):
    list_display = ('script', 'user')
    search_fields = ('user__username',)

admin.site.register(Script, ScriptAdmin)
admin.site.register(DeletedScript, DeletedScriptAdmin)
admin.site.register(ScriptData, ScriptDataAdmin)
admin.site.register(ScriptAccess, ScriptAccessAdmin)
admin.site.register(Project)
admin.site.register(Table, TableAdmin)
admin.site.register(TableLinksColl)
admin.site.register(LinkCategory)
admin.site.register(Link, LinkAdmin)
