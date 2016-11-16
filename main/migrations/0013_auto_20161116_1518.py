# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_auto_20161114_1736'),
    ]

    operations = [
        migrations.AlterField(
            model_name='link',
            name='text',
            field=models.TextField(null=True, blank=True),
        ),
    ]
