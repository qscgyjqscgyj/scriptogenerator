# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_customuser_middle_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='company',
            field=models.CharField(max_length=30, null=True, blank=True),
        ),
    ]
