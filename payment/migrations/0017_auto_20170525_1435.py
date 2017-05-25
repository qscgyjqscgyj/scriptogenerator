# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0016_paymentlog_sum'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paymentlog',
            name='date',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
