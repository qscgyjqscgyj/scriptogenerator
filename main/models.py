# -*- coding: utf-8 -*-
from django.db import models

from users.models import CustomUser


class Script(models.Model):
    name = models.CharField(max_length=1024)
    owner = models.ForeignKey(CustomUser, related_name='script_owner_custom_user')
    project = models.ForeignKey('Project', related_name='script_project_project')
    date = models.DateTimeField(auto_now_add=True)
    date_mod = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class Project(models.Model):
    name = models.CharField(max_length=1024)
    owner = models.ForeignKey(CustomUser, related_name='project_owner_custom_user')

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-pk',)


class Table(models.Model):
    name = models.CharField(max_length=1024)
    script = models.ForeignKey('Script', related_name='table_script_script')
    text_coll_name = models.CharField(max_length=1024, default='Текстовое поле')
    text_coll_size = models.IntegerField()
    text_coll_position = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    date_mod = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name


class TableLinksColl(models.Model):
    name = models.CharField(max_length=1024, default='Колонка с ссылками')
    size = models.IntegerField()
    position = models.IntegerField()
    table = models.ForeignKey('Table', related_name='table_links_coll_table_table')

    def __unicode__(self):
        return self.table.__unicode__()

    class Meta:
        ordering = ('position',)


class LinkCategory(models.Model):
    name = models.CharField(max_length=1024)
    table = models.ForeignKey('TableLinksColl', related_name='link_category_table_table_links_coll')
    hidden = models.BooleanField(default=False)
    order = models.IntegerField(blank=True, null=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-order',)


class Link(models.Model):
    name = models.CharField(max_length=1024)
    category = models.ForeignKey('LinkCategory', related_name='link_category_link_category')
    text = models.TextField()
    order = models.IntegerField(blank=True, null=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('-order',)
