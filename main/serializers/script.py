# -*- coding: utf-8 -*-
import json
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.loading import get_model
from rest_framework import serializers
from main.models import Script, ScriptAccess
from main.serializers.table import TableSerializer
from users.models import UserAccess
from users.serializers import UserSerializer
from scripts.tasks import clone_script_with_relations


class ScriptAccessField(serializers.Field):
    def to_representation(self, script):
        team = UserAccess.objects.filter(owner=script.owner)
        accesses = ScriptAccessSerializer(ScriptAccess.objects.filter(script=script), many=True).data
        for i, access in enumerate(accesses):
            try:
                teammate = team.get(user=int(access['user']['id']))
                accesses[i]['active'] = teammate.active
            except ObjectDoesNotExist:
                accesses[i]['active'] = False
        return accesses

    def get_attribute(self, accesses):
        return accesses

    def to_internal_value(self, accesses):
        return accesses


class ScriptTemplateField(serializers.Field):
    def to_representation(self, script):
        return None

    def get_attribute(self, template):
        return template

    def to_internal_value(self, template):
        return template


class ScriptAvailableField(serializers.Field):
    def to_representation(self, script):
        if script.owner.balance_total > 0:
            return True
        return False

    def get_attribute(self, available):
        return available

    def to_internal_value(self, available):
        return available


class ScriptDataField(serializers.Field):
    def to_representation(self, script):
        if not self.parent.empty_data:
            data = json.loads(script.data)
            validated_data = []
            for table in data:
                current_table = TableSerializer(data=table)
                if current_table.is_valid(raise_exception=True):
                    validated_data.append(current_table.validated_data)
            return validated_data
        return []

    def get_attribute(self, data):
        return data

    def to_internal_value(self, data):
        return data


class ScriptSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    accesses = ScriptAccessField(required=False)
    template = ScriptTemplateField(required=False, allow_null=True)
    available = ScriptAvailableField(read_only=True, allow_null=True)
    data = ScriptDataField(required=False)
    url = serializers.SerializerMethodField()
    view_url = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        empty_data = kwargs.pop('empty_data', None)
        super(ScriptSerializer, self).__init__(*args, **kwargs)
        self.empty_data = empty_data

    def get_url(self, script):
        return script.get_client_url()

    def get_view_url(self, script):
        return script.get_client_view_url()

    def create(self, validated_data):
        owner = get_model('users', 'CustomUser').objects.get(pk=int(self.initial_data.get('owner')['id']))

        template = self.initial_data.get('template')
        if template:
            template_script = Script.objects.get(pk=int(template['id']))
            owner.insert_cloning_script_task(
                clone_script_with_relations.delay(template_script.pk, [('name', validated_data.get('name')), ('active', False), ('owner__pk', owner.pk)]).task_id
            )
        else:
            del validated_data['template']
            script = Script(**validated_data)
            script.save()
        return template

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance

    class Meta:
        model = Script
        fields = ('id', 'name', 'owner', 'date', 'date_mod', 'accesses', 'active', 'template', 'available', 'url', 'view_url', 'data')


class ScriptAccessSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def create(self, validated_data):
        return ScriptAccess.objects.create(**validated_data)

    class Meta:
        model = ScriptAccess
        fields = ('id', 'user', 'edit')
