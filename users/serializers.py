from rest_framework import serializers

from users.models import CustomUser, UserAccess


class UserSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return CustomUser.objects.get(**validated_data)

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone')
        instance.first_name = validated_data.get('first_name')
        instance.middle_name = validated_data.get('middle_name')
        instance.last_name = validated_data.get('last_name')
        instance.company = validated_data.get('company')
        instance.save()
        return instance

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'phone', 'first_name', 'middle_name', 'last_name', 'company')


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
