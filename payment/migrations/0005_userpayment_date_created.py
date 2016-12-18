# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0004_auto_20161207_1351'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2016, 12, 18, 14, 11, 42, 286870), auto_now_add=True),
            preserve_default=False,
        ),
    ]
