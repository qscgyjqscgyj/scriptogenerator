# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_scriptaccess_edit'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='link',
            options={'ordering': ('order', 'pk')},
        ),
    ]
