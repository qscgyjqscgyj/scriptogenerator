from django.db.models.loading import get_model
from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    def create(self, validated_data):
        owner = self.initial_data.pop('owner', None)
        owner = get_model('users', 'CustomUser').objects.get(**owner)
        validated_data['owner'] = owner
        return Project.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance

    class Meta:
        model = Project
        fields = ('id', 'name', 'owner')


class ScriptAccessField(serializers.Field):
    def to_representation(self, script):
        return ScriptAccessSerializer(ScriptAccess.objects.filter(script=script), many=True).data

    def get_attribute(self, links):
        return links

    def to_internal_value(self, accesses):
        # for access in accesses:
        #     if not access.get('category'):
        #         if self.root.initial_data.get('links'):
        #             del self.root.initial_data['links']
        #         try:
        #             self.root.initial_data['table'] = Table.objects.get(pk=int(self.root.initial_data['table']))
        #         except TypeError:
        #             pass
        #         category, created = LinkCategory.objects.get_or_create(**self.root.initial_data)
        #         l['category'] = category
        #     elif isinstance(l.get('category'), int):
        #         l['category'] = LinkCategory.objects.get(pk=int(l.get('category')))
        #     if l.get('id'):
        #         link = Link.objects.get(pk=int(l.get('id')))
        #         link.name = l['name']
        #         link.order = l['order']
        #         link.text = l['text']
        #         link.save()
        #     else:
        #         Link.objects.create(**l)
        return accesses


class ScriptSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()
    owner = UserSerializer(read_only=True)
    accesses = ScriptAccessField()

    def create(self, validated_data):
        project = validated_data.pop('project', None)
        project = Project.objects.get(**project)
        validated_data['project'] = project

        owner = self.initial_data.pop('owner', None)
        owner = get_model('users', 'CustomUser').objects.get(**owner)
        validated_data['owner'] = owner

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
        fields = ('id', 'name', 'owner', 'project', 'date', 'date_mod', 'accesses')


class ScriptAccessSerializer(serializers.ModelSerializer):
    script = ScriptSerializer(read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = ScriptAccess
        fields = ('id', 'script', 'user')


class LinkSerializer(serializers.ModelSerializer):
    category = LinkCategory()

    def create(self, validated_data):
        validated_data['category'] = LinkCategory.objects.get(pk=int(validated_data['category']))
        return Link.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['category'] = LinkCategory.objects.get(pk=int(validated_data['category']))
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
        for l in links:
            if not l.get('category'):
                if self.root.initial_data.get('links'):
                    del self.root.initial_data['links']
                try:
                    self.root.initial_data['table'] = Table.objects.get(pk=int(self.root.initial_data['table']))
                except TypeError:
                    pass
                category, created = LinkCategory.objects.get_or_create(**self.root.initial_data)
                l['category'] = category
            elif isinstance(l.get('category'), int):
                l['category'] = LinkCategory.objects.get(pk=int(l.get('category')))
            if l.get('id'):
                link = Link.objects.get(pk=int(l.get('id')))
                link.name = l['name']
                link.order = l['order']
                link.text = l['text']
                link.save()
            else:
                Link.objects.create(**l)
        return links


class LinkCategoriesField(serializers.Field):
    def to_representation(self, coll):
        return LinkCategorySerializer(LinkCategory.objects.filter(table=coll), many=True).data

    def get_attribute(self, categories):
        return categories

    def to_internal_value(self, categories):
        for c in categories:
            if not c.get('table'):
                if self.root.initial_data.get('categories'):
                    del self.root.initial_data['categories']
                try:
                    self.root.initial_data['script'] = Script.objects.get(pk=int(self.root.initial_data['script']))
                except TypeError:
                    pass
                coll, created = TableLinksColl.objects.get_or_create(**self.root.initial_data)
                c['table'] = coll
            elif isinstance(c.get('table'), int):
                c['table'] = TableLinksColl.objects.get(pk=int(c.get('table')))
            if c.get('id'):
                category = LinkCategory.objects.get(pk=int(c.get('id')))
                category.name = c['name']
                category.order = c['order']
                category.save()
            else:
                LinkCategory.objects.create(**c)
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
