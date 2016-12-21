# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_auto_20161221_1430'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='middle_name',
            field=models.CharField(max_length=30, null=True, blank=True),
        ),
    ]
