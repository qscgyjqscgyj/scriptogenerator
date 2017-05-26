# -*- coding: utf-8 -*-
from rest_framework import serializers
from scripts.utils import readable_datetime_format


class DateTimeField(serializers.Field):
    def to_representation(self, instance):
        date = getattr(instance, self.field_name, None)
        if date:
            return readable_datetime_format(date)
        return ''

    def get_attribute(self, date):
        return date

    def to_internal_value(self, date):
        return date
