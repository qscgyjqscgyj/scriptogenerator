# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_customuser_free'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserAccess',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('active', models.BooleanField(default=True)),
                ('payed', models.DateTimeField(null=True, blank=True)),
                ('owner', models.ForeignKey(related_name='user_access_owner_custom_user', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(related_name='user_access_user_custom_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
