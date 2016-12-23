# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0007_localpayment'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='payment_data',
            field=models.TextField(null=True, blank=True),
        ),
    ]
