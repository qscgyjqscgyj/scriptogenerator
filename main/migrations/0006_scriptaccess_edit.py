# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_scriptaccess'),
    ]

    operations = [
        migrations.AddField(
            model_name='scriptaccess',
            name='edit',
            field=models.BooleanField(default=False),
        ),
    ]
