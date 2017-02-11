# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0021_script_is_present'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='cloning_task',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
    ]
