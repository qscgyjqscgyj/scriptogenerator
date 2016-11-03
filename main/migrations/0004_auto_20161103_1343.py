# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20161025_0212'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='link',
            options={'ordering': ('order',)},
        ),
        migrations.AlterModelOptions(
            name='linkcategory',
            options={'ordering': ('order',)},
        ),
    ]
