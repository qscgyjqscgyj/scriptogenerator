import datetime
import json

from rest_framework import serializers

from payment.tasks import get_payment_for_user
from users.models import CustomUser, UserAccess


class UserPromotedField(serializers.Field):
    def to_representation(self, user):
        return user.promoted()

    def get_attribute(self, promoted):
        return promoted

    def to_internal_value(self, promoted):
        return promoted


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    promoted = UserPromotedField(read_only=True)
    positive_balance = serializers.SerializerMethodField()

    def get_positive_balance(self, user):
        return user.positive_balance()

    def create(self, validated_data):
        return CustomUser.objects.get(**validated_data)

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone')
        instance.first_name = validated_data.get('first_name')
        instance.middle_name = validated_data.get('middle_name')
        instance.last_name = validated_data.get('last_name')
        instance.company = validated_data.get('company')
        instance.button_links_setting = validated_data.get('button_links_setting')
        instance.save()
        return instance

    class Meta:
        model = CustomUser
        fields = (
        'id', 'username', 'email', 'phone', 'first_name', 'middle_name', 'last_name', 'company', 'balance_total',
        'promoted', 'positive_balance', 'button_links_setting')


class UserAccessSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    # def create(self, validated_data):
    #     return UserAccess.objects.create(**validated_data)

    # def update(self, instance, validated_data):
    #     if not instance.active and validated_data.get('active') and instance.active_to_pay():
    #         get_payment_for_user(instance.pk)
    #         instance.payed = datetime.datetime.today()
    #     instance.active = validated_data.get('active')
    #     instance.save()
    #     return instance

    def create(self, validated_data):
        access = UserAccess.objects.create(**validated_data)
        get_payment_for_user(access.pk)
        access.payed = datetime.datetime.today()
        access.save()

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserAccess
        fields = ('id', 'owner', 'user')
