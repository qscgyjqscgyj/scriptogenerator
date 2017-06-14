# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0031_deletedscript_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='PageVideoInstruction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('page', models.IntegerField(choices=[(1, b'scripts'), (2, b'available_scripts'), (3, b'tables'), (4, b'available_tables'), (5, b'table_share'), (6, b'table_edit'), (7, b'profile'), (8, b'payment'), (9, b'team')])),
                ('youtube_video_id', models.CharField(max_length=255)),
            ],
        ),
    ]
