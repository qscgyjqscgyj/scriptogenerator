# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_useraccess_payed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccess',
            name='active',
            field=models.BooleanField(default=False),
        ),
    ]
