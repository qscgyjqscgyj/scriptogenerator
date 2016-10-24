# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20160922_2008'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='link',
            options={'ordering': ('-order',)},
        ),
        migrations.AlterModelOptions(
            name='linkcategory',
            options={'ordering': ('-order',)},
        ),
        migrations.AlterModelOptions(
            name='tablelinkscoll',
            options={'ordering': ('position',)},
        ),
    ]
