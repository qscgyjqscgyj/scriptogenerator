from rest_framework import serializers

from main.serializers.fields import DateTimeField
from payment.models import UserPayment, LocalPayment, PaymentLog, UserScriptDelegationAccess, \
    UserOfflineScriptExportAccess
from users.models import CustomUser


class UserPaymentSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)
    payed = DateTimeField(required=False, read_only=True)

    def create(self, validated_data):
        validated_data['user'] = CustomUser.objects.get(pk=validated_data.get('user'))
        return UserPayment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserPayment
        fields = ('id', 'name', 'user', 'sum', 'date', 'payed', 'total_sum')


class LocalPaymentSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)

    class Meta:
        model = LocalPayment
        fields = ('id', 'name', 'user', 'sum', 'date')


class PaymentLogSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)

    class Meta:
        model = PaymentLog
        fields = ('id', 'name', 'user', 'sum', 'debit_credit', 'date')


class UserScriptDelegationAccessSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)
    payed = DateTimeField(required=False, read_only=True)

    class Meta:
        model = UserScriptDelegationAccess
        fields = ('id', 'user', 'payed', 'date')


class UserOfflineScriptExportAccessSerializer(serializers.ModelSerializer):
    date = DateTimeField(required=False, read_only=True)
    payed = DateTimeField(required=False, read_only=True)

    class Meta:
        model = UserOfflineScriptExportAccess
        fields = ('id', 'user', 'payed', 'date')
