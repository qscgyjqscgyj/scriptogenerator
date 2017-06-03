# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0030_deletedscript'),
    ]

    operations = [
        migrations.AddField(
            model_name='deletedscript',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2017, 6, 3, 18, 51, 44, 725085), auto_now_add=True),
            preserve_default=False,
        ),
    ]
