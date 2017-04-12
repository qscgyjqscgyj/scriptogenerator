# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_customuser_team_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='last_visit',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
