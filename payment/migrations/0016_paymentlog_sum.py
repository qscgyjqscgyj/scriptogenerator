# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0015_auto_20170525_1351'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentlog',
            name='sum',
            field=models.FloatField(null=True, blank=True),
        ),
    ]
