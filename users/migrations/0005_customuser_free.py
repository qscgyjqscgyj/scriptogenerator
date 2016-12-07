# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20161128_1607'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='free',
            field=models.BooleanField(default=False),
        ),
    ]
