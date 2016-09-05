from rest_framework import serializers
from main.models import Script, Project


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
        script = Script(**validated_data)
        script.owner = self.request.user
        script.save()
        return script

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance

    class Meta:
        model = Script
        fields = ('id', 'name', 'owner', 'project', 'date', 'date_mod')
