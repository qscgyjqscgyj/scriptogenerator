# -*- coding: utf-8 -*-
from django.db import models

from users.models import CustomUser


class Script(models.Model):
    name = models.CharField(max_length=1024)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='script_parent_script', blank=True, null=True)
    owner = models.ForeignKey(CustomUser, related_name='script_owner_custom_user')
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, related_name='script_project_project', blank=True, null=True)
    data = models.TextField(default='[]')
    date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    date_mod = models.DateTimeField(auto_now=True)
    is_template = models.BooleanField(default=False)
    is_present = models.BooleanField(default=False)

    def get_client_url(self):
        return '/tables/' + str(self.pk) + '/'

    def get_client_view_url(self):
        result = '/tables/' + str(self.pk) + '/'
        tables = self.tables()
        if tables:
            result += 'table/' + str(tables[0].pk) + '/'
            links = tables[0].links()
            if links:
                result += 'link/' + str(links[0].pk) + '/share/'
        return result

    def accesses(self):
        return ScriptAccess.objects.filter(script=self)

    def tables(self):
        return Table.objects.filter(script=self)

    def links(self, parent=False):
        tables = [table.pk for table in self.tables()]
        if not parent:
            return Link.objects.filter(category__table__table__pk__in=tables)
        else:
            return Link.objects.filter(category__table__table__pk__in=tables, parent__isnull=False)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class ScriptAccess(models.Model):
    script = models.ForeignKey('Script', related_name='script_access_script_script')
    user = models.ForeignKey(CustomUser, related_name='script_access_user_custom_user')
    edit = models.BooleanField(default=False)

    def __unicode__(self):
        return self.script.__unicode__()


class Project(models.Model):
    name = models.CharField(max_length=1024)
    owner = models.ForeignKey(CustomUser, related_name='project_owner_custom_user')

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class Table(models.Model):
    name = models.CharField(max_length=1024)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='table_parent_table', blank=True, null=True)
    script = models.ForeignKey('Script', related_name='table_script_script')
    text_coll_name = models.CharField(max_length=1024, default='Текстовое поле')
    text_coll_size = models.IntegerField()
    text_coll_position = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    date_mod = models.DateTimeField(auto_now=True)

    def get_client_url(self):
        return '/tables/' + str(self.script.pk) + '/table/' + str(self.pk) + '/share/'

    def get_client_view_url(self):
        result = '/tables/' + str(self.script.pk) + '/table/' + str(self.pk) + '/'
        links = self.links()
        if links:
            result += 'link/' + str(links[0].pk) + '/share/'
        else:
            result += 'share/'
        return result

    def links(self):
        colls = [coll.pk for coll in TableLinksColl.objects.filter(table=self)]
        return Link.objects.filter(category__table__pk__in=colls)

    def colls(self):
        return TableLinksColl.objects.filter(table=self)

    def __unicode__(self):
        return self.name


class TableLinksColl(models.Model):
    name = models.CharField(max_length=1024, default='Колонка с ссылками')
    size = models.IntegerField()
    position = models.IntegerField()
    table = models.ForeignKey('Table', related_name='table_links_coll_table_table')

    def __unicode__(self):
        return self.table.__unicode__()

    def categories(self):
        return LinkCategory.objects.filter(table=self)

    class Meta:
        ordering = ('position',)


class LinkCategory(models.Model):
    name = models.CharField(max_length=1024)
    table = models.ForeignKey('TableLinksColl', related_name='link_category_table_table_links_coll')
    hidden = models.BooleanField(default=False)
    order = models.IntegerField(blank=True, null=True)
    opened = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('order',)


class Link(models.Model):
    name = models.CharField(max_length=1024)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='link_parent_link', blank=True, null=True)
    to_link = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='link_to_link', blank=True, null=True)
    category = models.ForeignKey('LinkCategory', related_name='link_category_link_category')
    text = models.TextField(blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)
    opened = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name + ' (' + str(self.category.table.table.script.pk) + ')'

    def get_client_url(self, edit=False):
        result = self.get_address()
        if edit:
            result += '/edit/'
        else:
            result += '/share/'
        return result

    def get_address(self):
        return '/tables/%(script)s/table/%(table)s/link/%(link)s' % dict(
            script=self.category.table.table.script.pk,
            table=self.category.table.table.pk,
            link=self.pk
        )

    def get_parent_address(self):
        if self.parent:
            return '/tables/%(script)s/table/%(table)s/link/%(link)s' % dict(
                script=self.category.table.table.script.parent.pk,
                table=self.category.table.table.parent.pk,
                link=self.parent.pk
            )
        return None

    def clone_save(self):
        for link in self.category.table.table.script.links():
            self.text = self.text.replace(link.get_parent_address(), link.get_address())
        return self.save()

    class Meta:
        ordering = ('order', 'pk')
