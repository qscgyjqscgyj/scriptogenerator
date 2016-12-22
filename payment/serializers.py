from rest_framework import serializers

from payment.models import UserPayment
from users.models import CustomUser
from users.serializers import UserSerializer


class UserPaymentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data['user'] = CustomUser.objects.get(pk=validated_data.get('user'))
        return UserPayment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserPayment
        fields = ('id', 'user', 'sum', 'date_created', 'payed', 'total_sum')
