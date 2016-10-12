from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link


class ProjectSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return Project.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance

    class Meta:
        model = Project
        fields = ('id', 'name', 'owner')


class ScriptSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()

    def create(self, validated_data):
        project = validated_data.pop('project', None)
        project = Project.objects.get(**project)
        validated_data['project'] = project
        script = Script(**validated_data)
        script.save()
        return script

    def update(self, instance, validated_data):
        project = validated_data.pop('project', None)

        instance.name = validated_data.get('name', instance.name)
        instance.project = Project.objects.get(**project)
        instance.save()
        return instance

    class Meta:
        model = Script
        fields = ('id', 'name', 'owner', 'project', 'date', 'date_mod')


class LinkSerializer(serializers.ModelSerializer):
    category = LinkCategory()

    def create(self, validated_data):
        return Link.objects.get_or_create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.text = validated_data.get('text', instance.text)
        instance.category = validated_data.get('category', instance.category)
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        return instance

    class Meta:
        model = Link
        fields = ('id', 'name', 'category', 'text', 'order')


class LinksField(serializers.Field):
    def to_representation(self, category):
        return LinkSerializer(Link.objects.filter(category=category), many=True).data

    def get_attribute(self, links):
        return links

    def to_internal_value(self, links):
        # for l in links:
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
        return links


class LinkCategoriesField(serializers.Field):
    def to_representation(self, coll):
        return LinkCategorySerializer(LinkCategory.objects.filter(table=coll), many=True).data

    def get_attribute(self, categories):
        return categories

    def to_internal_value(self, categories):
        # for l in links:
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
        return categories


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
        return TableLinksCollSerializer(TableLinksColl.objects.filter(table=table), many=True).data

    def get_attribute(self, colls):
        return colls

    def to_internal_value(self, colls):
        for c in colls:
            if not c.get('table'):
                if self.root.initial_data.get('colls'):
                    del self.root.initial_data['colls']
                try:
                    self.root.initial_data['script'] = Script.objects.get(pk=int(self.root.initial_data['script']))
                except TypeError:
                    pass
                table, created = Table.objects.get_or_create(**self.root.initial_data)
                c['table'] = table
            elif isinstance(c.get('table'), int):
                c['table'] = Table.objects.get(pk=c.get('table'))
            if c.get('id'):
                coll = TableLinksColl.objects.get(pk=int(c.get('id')))
                coll.name = c['name']
                coll.position = c['position']
                coll.size = c['size']
                coll.save()
            else:
                TableLinksColl.objects.create(**c)
        return colls


class TableSerializer(serializers.ModelSerializer):
    colls = CollsField()

    def create(self, validated_data):
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
        model = Table
        fields = ('id', 'name', 'script', 'text_coll_name', 'text_coll_size', 'text_coll_position', 'date', 'date_mod', 'colls')


class LinkCategorySerializer(serializers.ModelSerializer):
    links = LinksField(required=False)

    def create(self, validated_data):
        validated_data['table'] = TableLinksColl.objects.get(pk=int(validated_data['table']))
        return LinkCategory.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        return instance

    class Meta:
        model = LinkCategory
        fields = ('id', 'name', 'hidden', 'order', 'table', 'links')
