from rest_framework import serializers

from payment.models import UserPayment
from users.serializers import UserSerializer


class UserPaymentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    def create(self, validated_data):
        return UserPayment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = UserPayment
        fields = ('id', 'user', 'sum', 'date_created', 'payed', 'total_sum')
