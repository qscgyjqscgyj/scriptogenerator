# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0008_userpayment_payment_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='balance',
            name='user',
        ),
        migrations.DeleteModel(
            name='Bonus',
        ),
        migrations.DeleteModel(
            name='Balance',
        ),
    ]
