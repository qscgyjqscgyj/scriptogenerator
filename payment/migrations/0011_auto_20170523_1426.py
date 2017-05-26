# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0010_userpayment_promotion'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='localpayment',
            options={'ordering': ('-pk',)},
        ),
        migrations.RenameField(
            model_name='userpayment',
            old_name='date_created',
            new_name='date',
        ),
    ]
