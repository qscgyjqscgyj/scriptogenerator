from django.contrib import admin
from main.models import *


class ScriptAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'active',)
    search_fields = ('owner__email',)
    list_filter = ('active',)


class ScriptDataAdmin(admin.ModelAdmin):
    list_display = ('script',)
    search_fields = ('script__pk',)


class TableAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')


class LinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'to_link', 'category', 'parent')


admin.site.register(Script, ScriptAdmin)
admin.site.register(ScriptData, ScriptDataAdmin)
admin.site.register(ScriptAccess)
admin.site.register(Project)
admin.site.register(Table, TableAdmin)
admin.site.register(TableLinksColl)
admin.site.register(LinkCategory)
admin.site.register(Link, LinkAdmin)
