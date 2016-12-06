# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0014_link_to_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
