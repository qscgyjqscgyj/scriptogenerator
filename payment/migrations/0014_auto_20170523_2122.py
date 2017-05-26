# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0026_remove_script_data'),
        ('payment', '0013_userofflinescriptexportaccess_userscriptdelegationaccess'),
    ]

    operations = [
        migrations.AddField(
            model_name='userscriptdelegationaccess',
            name='delegated_script',
            field=models.ForeignKey(related_name='user_script_delegation_access_delegated_script_script', blank=True, to='main.Script', null=True),
        ),
        migrations.AddField(
            model_name='userscriptdelegationaccess',
            name='delegated_user',
            field=models.ForeignKey(related_name='user_script_delegation_access_delegated_user_custom_user', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
