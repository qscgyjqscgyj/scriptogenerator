# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0018_userofflinescriptexportaccess_exported_date'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userofflinescriptexportaccess',
            options={'ordering': ('-pk',)},
        ),
    ]
