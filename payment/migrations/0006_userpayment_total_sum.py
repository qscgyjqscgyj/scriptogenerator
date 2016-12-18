# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0005_userpayment_date_created'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='total_sum',
            field=models.FloatField(default=0),
        ),
    ]
