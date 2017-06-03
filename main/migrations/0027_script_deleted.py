# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0026_remove_script_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
    ]
