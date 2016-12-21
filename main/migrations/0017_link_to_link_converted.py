# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0016_auto_20161212_1250'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='to_link_converted',
            field=models.BooleanField(default=False),
        ),
    ]
