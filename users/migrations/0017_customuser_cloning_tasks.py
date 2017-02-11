# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_auto_20170131_1530'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='cloning_tasks',
            field=models.TextField(null=True, blank=True),
        ),
    ]
