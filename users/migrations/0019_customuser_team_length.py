# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_remove_customuser_cloning_tasks'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='team_length',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
