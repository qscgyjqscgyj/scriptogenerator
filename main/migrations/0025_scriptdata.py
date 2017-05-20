# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0024_script_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScriptData',
            fields=[
                ('script', models.OneToOneField(primary_key=True, serialize=False, to='main.Script')),
                ('data', models.TextField(default=b'[]')),
            ],
        ),
    ]
