# -*- coding: utf-8 -*-
from rest_framework import serializers
from main.models import Link


class LinksField(serializers.Field):
    def validate_links(self, links):
        validated_data = []
        for link in links:
            serialized_link = LinkSerializer(data=link)
            if serialized_link.is_valid(raise_exception=True):
                validated_data.append(serialized_link.validated_data)
        return validated_data

    def to_representation(self, category):
        return self.validate_links(category['links'])

    def get_attribute(self, links):
        return self.validate_links(links)

    def to_internal_value(self, links):
        return self.validate_links(links)


class LinkCategoriesField(serializers.Field):
    def validate_categories(self, categories):
        validated_data = []
        for category in categories:
            serialized_category = LinkCategorySerializer(data=category)
            if serialized_category.is_valid(raise_exception=True):
                validated_data.append(serialized_category.validated_data)
        return validated_data

    def to_representation(self, coll):
        return self.validate_categories(coll['categories'])

    def get_attribute(self, categories):
        return self.validate_categories(categories)

    def to_internal_value(self, categories):
        return self.validate_categories(categories)


class FalseField(serializers.Field):
    def to_representation(self, editable_object):
        return False

    def get_attribute(self, edit):
        return False

    def to_internal_value(self, edit):
        return False


class LinkCategorySerializer(serializers.Serializer):
    id = serializers.CharField(required=True)
    name = serializers.CharField(required=True)
    order = serializers.IntegerField(required=True, allow_null=True)
    hidden = serializers.BooleanField(required=True)
    links = LinksField(required=False)
    edit = FalseField(allow_null=True, required=False)
    opened = FalseField(allow_null=True, required=False)

    class Meta:
        fields = ('id', 'name', 'hidden', 'order', 'links', 'opened')


class LinkSerializer(serializers.Serializer):
    id = serializers.CharField(required=True)
    name = serializers.CharField(required=True)
    to_link = serializers.CharField(required=False, allow_null=True)
    text = serializers.CharField(required=False, allow_null=True)
    order = serializers.IntegerField(required=True, allow_null=True)
    edit = FalseField(allow_null=True, required=False)
    opened = FalseField(allow_null=True, required=False)

    class Meta:
        fields = ('id', 'name', 'to_link', 'text', 'order', 'opened')
