# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_remove_useraccess_payed'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='free',
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone',
            field=models.CharField(max_length=1025, null=True, blank=True),
        ),
    ]
