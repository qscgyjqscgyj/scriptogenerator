# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0022_script_cloning_task'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='script',
            name='cloning_task',
        ),
    ]
