from django.db.models.loading import get_model
from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from main.serializers.link import LinkCategoriesField
from users.serializers import UserSerializer


class TableLinksCollSerializer(serializers.ModelSerializer):
    categories = LinkCategoriesField()

    def create(self, validated_data):
        return TableLinksColl.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.name = validated_data.get('size', instance.size)
        instance.name = validated_data.get('position', instance.position)
        instance.save()
        return instance

    class Meta:
        model = TableLinksColl
        fields = ('id', 'table', 'name', 'size', 'position', 'categories')


class CollsField(serializers.Field):
    def to_representation(self, table):
        return table['colls']

    def get_attribute(self, colls):
        return colls

    def to_internal_value(self, colls):
        # for c in colls:
        #     if not c.get('table'):
        #         if self.root.initial_data.get('colls'):
        #             del self.root.initial_data['colls']
        #         try:
        #             self.root.initial_data['script'] = Script.objects.get(pk=int(self.root.initial_data['script']))
        #         except TypeError:
        #             pass
        #         table, created = Table.objects.get_or_create(**self.root.initial_data)
        #         c['table'] = table
        #     elif isinstance(c.get('table'), int):
        #         c['table'] = Table.objects.get(pk=c.get('table'))
        #     if c.get('id'):
        #         coll = TableLinksColl.objects.get(pk=int(c.get('id')))
        #         coll.name = c['name']
        #         coll.position = c['position']
        #         coll.size = c['size']
        #         coll.save()
        #     else:
        #         TableLinksColl.objects.create(**c)
        return colls


class TableSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    old_id = serializers.IntegerField(allow_null=True)
    name = serializers.CharField(required=True)
    text_coll_name = serializers.CharField(required=True)
    text_coll_size = serializers.IntegerField(required=True)
    text_coll_position = serializers.IntegerField(required=True)
    date = serializers.DateTimeField(required=True)
    date_mod = serializers.DateTimeField(required=True)
    colls = CollsField()

    def create(self, validated_data):
        if validated_data.get('colls'):
            del validated_data['colls']
        return Table.objects.get_or_create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.text_coll_name = validated_data.get('text_coll_name', instance.text_coll_name)
        instance.text_coll_size = validated_data.get('text_coll_size', instance.text_coll_size)
        instance.text_coll_position = validated_data.get('text_coll_position', instance.text_coll_position)
        instance.save()
        return instance

    class Meta:
        fields = ('id', 'old_id', 'name', 'text_coll_name', 'text_coll_size', 'text_coll_position', 'date', 'date_mod', 'colls')


class ScriptTablesField(serializers.Field):
    def to_representation(self, script):
        return TableSerializer(Table.objects.filter(script__pk=script.pk), many=True).data

    def get_attribute(self, tables):
        return tables

    def to_internal_value(self, tables):
        return tables
