# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_script_parent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='script',
            name='parent',
            field=models.ForeignKey(related_name='script_parent_script', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Script', null=True),
        ),
    ]
