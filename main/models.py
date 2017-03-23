# -*- coding: utf-8 -*-
import json

from django.db import models

from users.models import CustomUser


class Script(models.Model):
    name = models.CharField(max_length=1024)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='script_parent_script', blank=True, null=True)
    owner = models.ForeignKey(CustomUser, related_name='script_owner_custom_user')
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, related_name='script_project_project', blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    date_mod = models.DateTimeField(auto_now=True)
    is_template = models.BooleanField(default=False)
    is_present = models.BooleanField(default=False)

    def get_client_url(self):
        return '/tables/' + str(self.pk) + '/'

    def data(self):
        data, created = ScriptData.objects.get_or_create(script=self)
        return data.data

    def get_client_view_url(self):
        result = '/tables/' + str(self.pk) + '/'
        tables = self.tables()
        if tables:
            result += 'table/' + str(tables[0]['id']) + '/'
            links = self.links(table_id=tables[0]['id'])
            if links:
                result += 'link/' + str(links[0]['id']) + '/share/'
        return result

    def accesses(self):
        return ScriptAccess.objects.filter(script=self)

    def replace_table(self, table, index):
        script_data = ScriptData.objects.get(script=self)
        data = json.loads(script_data.data)
        data[index] = table
        script_data.data = json.dumps(data)
        script_data.save()

    def tables(self, table_id=None):
        data = json.loads(self.data())
        if table_id:
            return [{'data': table, 'index': i} for i, table in enumerate(data) if table['id'] == table_id][0]
        return data

    def colls(self, table_id=None, coll_id=None):
        data = json.loads(self.data())
        if table_id:
            table_data = self.tables(table_id=table_id)
            if coll_id:
                return [{'data': coll, 'index': i} for i, coll in enumerate(table_data['data']['colls']) if coll['id'] == coll_id][0]
            else:
                return data['colls']
        else:
            result = []
            for table in data:
                for coll in table['colls']:
                    result.append(coll)
            return result

    def categories(self, table_id=None, coll_id=None, category_id=None):
        data = json.loads(self.data())
        if table_id and coll_id:
            coll_data = self.colls(table_id=table_id, coll_id=coll_id)
            if category_id:
                return [{'data': category, 'index': i} for i, category in enumerate(coll_data['data']['categories']) if category['id'] == category_id][0]
            else:
                return coll_data['categories']
        else:
            result = []
            for table in data:
                for coll in table['colls']:
                    for category in coll['categories']:
                        result.append(category)
            return result

    def links(self, table_id=None, coll_id=None, category_id=None, link_id=None):
        data = json.loads(self.data())
        if table_id and coll_id and category_id:
            category_data = self.categories(table_id=table_id, coll_id=coll_id, category_id=category_id)
            if link_id:
                return [{'data': link, 'index': i} for i, link in enumerate(category_data['data']['links']) if link['id'] == link_id][0]
            else:
                return category_data['links']
        else:
            result = []
            for table in data:
                for coll in table['colls']:
                    for category in coll['categories']:
                        for link in category['links']:
                            result.append(link)
            return result

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class ScriptData(models.Model):
    script = models.OneToOneField(Script, primary_key=True)
    data = models.TextField(default='[]')

    def __unicode__(self):
        return self.script.__unicode__()


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

    def links(self):
        return Link.objects.filter(category=self)

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
