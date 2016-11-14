# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_auto_20161111_1910'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='parent',
            field=models.ForeignKey(related_name='script_parent_script', blank=True, to='main.Script', null=True),
        ),
    ]
