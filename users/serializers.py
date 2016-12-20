from rest_framework import serializers

from users.models import CustomUser, UserAccess


class UserSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return CustomUser.objects.get(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'phone')


class UserAccessSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    def create(self, validated_data):
        return UserAccess.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.active = validated_data.get('active')
        instance.save()
        return instance

    class Meta:
        model = UserAccess
        fields = ('id', 'owner', 'user', 'active')
