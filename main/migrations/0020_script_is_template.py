# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0019_auto_20161221_1606'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='is_template',
            field=models.BooleanField(default=False),
        ),
    ]
