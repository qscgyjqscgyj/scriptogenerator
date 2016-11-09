# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20160907_2103'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='web_site',
        ),
    ]
