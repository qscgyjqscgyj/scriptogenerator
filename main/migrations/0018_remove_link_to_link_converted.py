# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0017_link_to_link_converted'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='link',
            name='to_link_converted',
        ),
    ]
