from rest_framework import serializers

from users.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    # packages = UserPackagesField(read_only=True, allow_null=True)

    def create(self, validated_data):
        return CustomUser.objects.get(**validated_data)

    def update(self, instance, validated_data):
        return instance

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'free')
