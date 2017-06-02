# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0017_auto_20170525_1435'),
    ]

    operations = [
        migrations.AddField(
            model_name='userofflinescriptexportaccess',
            name='exported_date',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
