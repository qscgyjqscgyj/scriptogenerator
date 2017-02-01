# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0009_auto_20161226_2149'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpayment',
            name='promotion',
            field=models.BooleanField(default=False),
        ),
    ]
