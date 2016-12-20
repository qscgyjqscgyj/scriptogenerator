# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_useraccess'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='useraccess',
            name='payed',
        ),
    ]
