# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_auto_20161220_1734'),
    ]

    operations = [
        migrations.AddField(
            model_name='useraccess',
            name='payed',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
