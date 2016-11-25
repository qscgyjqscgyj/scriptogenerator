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
