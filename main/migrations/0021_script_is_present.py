# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0020_script_is_template'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='is_present',
            field=models.BooleanField(default=False),
        ),
    ]
