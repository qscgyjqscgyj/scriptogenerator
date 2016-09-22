from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl


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


class TableSerializer(serializers.ModelSerializer):
    script = ScriptSerializer()
    # colls = serializers.SerializerMethodField('colls')

    def create(self, validated_data):
        # script = validated_data.pop('script', None)
        # script = Script.objects.get(**script)
        # validated_data['script'] = script
        return Table.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.text_coll_name = validated_data.get('text_coll_name', instance.text_coll_name)
        instance.text_coll_size = validated_data.get('text_coll_size', instance.text_coll_size)
        instance.text_coll_position = validated_data.get('text_coll_position', instance.text_coll_position)
        instance.save()
        return instance

    class Meta:
        model = Table
        fields = ('id', 'name', 'script', 'text_coll_name', 'text_coll_size', 'text_coll_position', 'date', 'date_mod')


class TableLinksCollSerializer(serializers.ModelSerializer):
    table = TableSerializer()

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
        fields = ('id', 'name', 'size', 'position')
