# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0019_auto_20170531_1759'),
        ('main', '0028_auto_20170603_1834'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='deletedscript',
            name='script_ptr',
        ),
        migrations.DeleteModel(
            name='DeletedScript',
        ),
    ]
