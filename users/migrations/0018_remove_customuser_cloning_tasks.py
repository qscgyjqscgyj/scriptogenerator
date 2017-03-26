# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_customuser_cloning_tasks'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='cloning_tasks',
        ),
    ]
