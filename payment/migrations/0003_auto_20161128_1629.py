# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0002_auto_20161124_1410'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='additional_months',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userpayment',
            name='additional_users',
            field=models.IntegerField(default=0),
        ),
    ]
