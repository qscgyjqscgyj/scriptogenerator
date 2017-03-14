# -*- coding: utf-8 -*-
from rest_framework import serializers
from main.serializers.link import LinkCategoriesField


class CollsField(serializers.Field):
    def validate_colls(self, colls):
        validated_data = []
        for coll in colls:
            serialized_coll = TableLinksCollSerializer(data=coll)
            if serialized_coll.is_valid():
                validated_data.append(serialized_coll.validated_data)
            else:
                print(serialized_coll.errors)
                raise ValueError
        return validated_data

    def to_representation(self, table):
        return self.validate_colls(table['colls'])

    def get_attribute(self, colls):
        return self.validate_colls(colls)

    def to_internal_value(self, colls):
        return self.validate_colls(colls)


class TableSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(required=True)
    text_coll_name = serializers.CharField(required=True)
    text_coll_size = serializers.IntegerField(required=True)
    text_coll_position = serializers.IntegerField(required=True)
    date = serializers.DateTimeField(required=True)
    date_mod = serializers.DateTimeField(required=True)
    colls = CollsField()

    class Meta:
        fields = ('id', 'name', 'text_coll_name', 'text_coll_size', 'text_coll_position', 'date', 'date_mod', 'colls')


class TableLinksCollSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(required=True)
    size = serializers.IntegerField(required=True)
    position = serializers.IntegerField(required=True)
    categories = LinkCategoriesField()

    class Meta:
        fields = ('id', 'name', 'size', 'position', 'categories')
