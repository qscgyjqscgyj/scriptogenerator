# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0025_scriptdata'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='script',
            name='data',
        ),
    ]