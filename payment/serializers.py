from rest_framework import serializers

from payment.models import UserPayment, LocalPayment
from users.models import CustomUser


class UserPaymentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['user'] = CustomUser.objects.get(pk=validated_data.get('user'))
        return UserPayment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserPayment
        fields = ('id', 'user', 'sum', 'date_created', 'payed', 'total_sum')


class LocalPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalPayment
        fields = ('id', 'name', 'user', 'sum', 'date')
