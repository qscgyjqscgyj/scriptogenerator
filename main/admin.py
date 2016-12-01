from django.contrib import admin
from main.models import *


class LinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'to_link', 'category')


admin.site.register(Script)
admin.site.register(ScriptAccess)
admin.site.register(Project)
admin.site.register(Table)
admin.site.register(TableLinksColl)
admin.site.register(LinkCategory)
admin.site.register(Link, LinkAdmin)
