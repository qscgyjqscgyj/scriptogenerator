from django.db.models.loading import get_model
from rest_framework import serializers
from main.models import Script, Project, Table, TableLinksColl, LinkCategory, Link, ScriptAccess
from main.serializers.project import ProjectSerializer
from users.serializers import UserSerializer


class ScriptAccessField(serializers.Field):
    def to_representation(self, script):
        return ScriptAccessSerializer(ScriptAccess.objects.filter(script=script), many=True).data

    def get_attribute(self, accesses):
        return accesses

    def to_internal_value(self, accesses):
        return accesses


class ScriptSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    accesses = ScriptAccessField(required=False)

    def create(self, validated_data):
        # if self._kwargs['data'].get('project'):
        #     project = Project.objects.get(pk=self._kwargs['data']['project']['id'])
        #     validated_data['project'] = project

        owner = self.initial_data.pop('owner', None)
        owner = get_model('users', 'CustomUser').objects.get(**owner)
        validated_data['owner'] = owner

        script = Script(**validated_data)
        script.save()
        return script

    def update(self, instance, validated_data):
        # project = validated_data.pop('project', None)

        instance.name = validated_data.get('name', instance.name)
        # instance.project = Project.objects.get(**project)
        instance.save()
        return instance

    class Meta:
        model = Script
        fields = ('id', 'name', 'owner', 'date', 'date_mod', 'accesses', 'active')


class ScriptAccessSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def create(self, validated_data):
        return ScriptAccess.objects.create(**validated_data)

    class Meta:
        model = ScriptAccess
        fields = ('id', 'user', 'edit')
