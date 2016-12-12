# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0015_script_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='opened',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='linkcategory',
            name='opened',
            field=models.BooleanField(default=False),
        ),
    ]
