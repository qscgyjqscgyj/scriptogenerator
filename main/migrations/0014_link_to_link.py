# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0013_auto_20161116_1518'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='to_link',
            field=models.ForeignKey(related_name='link_to_link', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Link', null=True),
        ),
    ]
