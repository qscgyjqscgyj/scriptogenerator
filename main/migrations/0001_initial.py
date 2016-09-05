# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('text', models.TextField()),
                ('order', models.IntegerField(null=True, blank=True)),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='LinkCategory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('hidden', models.BooleanField(default=False)),
                ('order', models.IntegerField(null=True, blank=True)),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('owner', models.ForeignKey(related_name='project_owner_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Script',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('date_mod', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(related_name='script_owner_custom_user', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(related_name='script_project_project', to='main.Project')),
            ],
        ),
        migrations.CreateModel(
            name='Table',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('text_coll_size', models.IntegerField()),
                ('text_coll_position', models.IntegerField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('date_mod', models.DateTimeField(auto_now=True)),
                ('script', models.ForeignKey(related_name='table_script_script', to='main.Script')),
            ],
        ),
        migrations.CreateModel(
            name='TableLinksColl',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('size', models.IntegerField()),
                ('position', models.IntegerField()),
                ('table', models.ForeignKey(related_name='table_links_coll_table_table', to='main.Table')),
            ],
        ),
        migrations.AddField(
            model_name='linkcategory',
            name='table',
            field=models.ForeignKey(related_name='link_category_table_table_links_coll', to='main.TableLinksColl'),
        ),
        migrations.AddField(
            model_name='link',
            name='category',
            field=models.ForeignKey(related_name='link_category_link_category', to='main.LinkCategory'),
        ),
    ]
