from rest_framework import serializers
from users.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return CustomUser.objects.get(**validated_data)

    def update(self, instance, validated_data):
        # instance.name = validated_data.get('name', instance.name)
        # instance.order = validated_data.get('order', instance.order)
        # instance.save()
        return instance

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email')
