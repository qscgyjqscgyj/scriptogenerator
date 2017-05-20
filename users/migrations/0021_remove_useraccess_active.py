# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_customuser_last_visit'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='useraccess',
            name='active',
        ),
    ]
