# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0029_auto_20170603_1849'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeletedScript',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=1024)),
                ('data', models.TextField(default=b'[]')),
                ('owner', models.ForeignKey(related_name='deleted_script_owner_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
