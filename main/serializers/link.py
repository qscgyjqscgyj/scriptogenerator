from django.db.models.loading import get_model
from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from users.serializers import UserSerializer


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
                link.opened = l['opened']
                link.save()
            else:
                Link.objects.create(**l)
        return links


class CustomBooleanField(serializers.Field):
    def to_representation(self, obj):
        return False

    def get_attribute(self, obj):
        return None

    def to_internal_value(self, obj):
        return None


class LinkCategorySerializer(serializers.ModelSerializer):
    links = LinksField(required=False)
    edit = CustomBooleanField(allow_null=True, required=False)

    def create(self, validated_data):
        validated_data['table'] = TableLinksColl.objects.get(pk=int(validated_data['table']))
        return LinkCategory.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.order = validated_data.get('order', instance.order)
        instance.opened = validated_data.get('opened', instance.order)
        instance.save()
        return instance

    class Meta:
        model = LinkCategory
        fields = ('id', 'name', 'hidden', 'order', 'table', 'links', 'opened', 'edit')


class ToLinkField(serializers.Field):
    def to_representation(self, link):
        result = LinkSerializer(link).data
        result['href'] = link.get_address()
        return result

    def get_attribute(self, link):
        return link.to_link

    def to_internal_value(self, link):
        return link


class LinkSerializer(serializers.ModelSerializer):
    category = LinkCategory()
    to_link = ToLinkField(allow_null=True)
    edit = CustomBooleanField(allow_null=True, required=False)

    def create(self, validated_data):
        validated_data['category'] = LinkCategory.objects.get(pk=int(validated_data['category']))
        validated_data['to_link'] = Link.objects.get(pk=int(validated_data['to_link'])) if validated_data.get('to_link') else None
        return Link.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data['category'] = LinkCategory.objects.get(pk=int(validated_data['category']))
        instance.name = validated_data.get('name', instance.name)
        instance.text = validated_data.get('text', instance.text)
        instance.category = validated_data.get('category', instance.category)
        instance.order = validated_data.get('order', instance.order)
        instance.opened = validated_data.get('opened', instance.order)
        instance.save()
        return instance

    class Meta:
        model = Link
        fields = ('id', 'name', 'category', 'text', 'order', 'to_link', 'opened', 'edit')


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
                category.opened = c['opened']
                category.save()
                for link in c.get('links'):
                    link_serializer = LinkSerializer(data=link)
                    if link_serializer.is_valid():
                        link_serializer.update(Link.objects.get(pk=int(link['id'])), link)
            else:
                LinkCategory.objects.create(**c)
        return categories
