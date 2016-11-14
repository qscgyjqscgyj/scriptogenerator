# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_auto_20161114_1652'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='parent',
            field=models.ForeignKey(related_name='link_parent_link', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Link', null=True),
        ),
        migrations.AddField(
            model_name='table',
            name='parent',
            field=models.ForeignKey(related_name='table_parent_table', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Table', null=True),
        ),
    ]
