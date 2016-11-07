# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0004_auto_20161103_1343'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScriptAccess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('script', models.ForeignKey(related_name='script_access_script_script', to='main.Script')),
                ('user', models.ForeignKey(related_name='script_access_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
