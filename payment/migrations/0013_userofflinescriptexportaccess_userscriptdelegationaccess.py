# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0026_remove_script_data'),
        ('payment', '0012_userpayment_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserOfflineScriptExportAccess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('script_data', models.TextField(null=True, blank=True)),
                ('exported', models.BooleanField(default=False)),
                ('unlim_months', models.IntegerField(null=True, blank=True)),
                ('payed', models.DateTimeField(null=True, blank=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('script', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Script', null=True)),
                ('user', models.ForeignKey(related_name='user_offline_script_export_access_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserScriptDelegationAccess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('delegated', models.BooleanField(default=False)),
                ('payed', models.DateTimeField(null=True, blank=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(related_name='user_script_delegation_access_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
