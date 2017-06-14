# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0022_customuser_button_links_setting'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='video_instructions_settings',
            field=models.BooleanField(default=True),
        ),
    ]
