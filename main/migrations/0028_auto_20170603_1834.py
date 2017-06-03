# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0027_script_deleted'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeletedScript',
            fields=[
                ('script_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.Script')),
                ('data', models.TextField(default=b'[]')),
            ],
            bases=('main.script',),
        ),
        migrations.RemoveField(
            model_name='script',
            name='deleted',
        ),
    ]
