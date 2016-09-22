# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='project',
            options={'ordering': ('-pk',)},
        ),
        migrations.AlterModelOptions(
            name='script',
            options={'ordering': ('-pk',)},
        ),
        migrations.AddField(
            model_name='table',
            name='text_coll_name',
            field=models.CharField(default=b'\xd0\xa2\xd0\xb5\xd0\xba\xd1\x81\xd1\x82\xd0\xbe\xd0\xb2\xd0\xbe\xd0\xb5 \xd0\xbf\xd0\xbe\xd0\xbb\xd0\xb5', max_length=1024),
        ),
        migrations.AddField(
            model_name='tablelinkscoll',
            name='name',
            field=models.CharField(default=b'\xd0\x9a\xd0\xbe\xd0\xbb\xd0\xbe\xd0\xbd\xd0\xba\xd0\xb0 \xd1\x81 \xd1\x81\xd1\x81\xd1\x8b\xd0\xbb\xd0\xba\xd0\xb0\xd0\xbc\xd0\xb8', max_length=1024),
        ),
    ]
