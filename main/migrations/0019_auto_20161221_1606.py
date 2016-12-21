# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0018_remove_link_to_link_converted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='script',
            name='project',
            field=models.ForeignKey(related_name='script_project_project', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Project', null=True),
        ),
    ]
