# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_remove_useraccess_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='button_links_setting',
            field=models.BooleanField(default=False),
        ),
    ]
