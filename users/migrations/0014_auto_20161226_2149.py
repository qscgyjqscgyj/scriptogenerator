# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_customuser_utm'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='balance_real',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='customuser',
            name='balance_total',
            field=models.FloatField(default=0.0),
        ),
    ]
