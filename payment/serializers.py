# from rest_framework import serializers
#
# from payment.models import Package, UserPackage, UserPackageAccess
#
#
# class AdditionalField(serializers.Field):
#     def to_representation(self, package):
#         return UserPackageSerializer(UserPackage.objects.filter(package=package)).data
#
#     def get_attribute(self, package):
#         return package
#
#     def to_internal_value(self, additional):
#         return additional
#
#
# class UserPackagesField(serializers.Field):
#     def to_representation(self, user):
#         packages = UserPackage.objects.filter(user=user)
#         if packages:
#             return UserPackageSerializer(packages, many=True).data
#         return None
#
#     def get_attribute(self, user):
#         return user
#
#     def to_internal_value(self, packages):
#         return packages
#
#
# class PackageSerializer(serializers.ModelSerializer):
#     additional = AdditionalField()
#
#     def create(self, validated_data):
#         return Package.objects.get(**validated_data)
#
#     def update(self, instance, validated_data):
#         return instance
#
#     class Meta:
#         model = Package
#         fields = ('id', 'name', 'default_users_count', 'default_month_count', 'start_cost', 'cost_per_user',
#                   'additional')
#
#
# class ExtensionOfField(serializers.Field):
#     def to_representation(self, user_package):
#         return UserPackageSerializer(user_package).data
#
#     def get_attribute(self, user_package):
#         return user_package.extension_of
#
#     def to_internal_value(self, user_package):
#         return user_package
#
#
# class UserPackageSerializer(serializers.ModelSerializer):
#     extension_of = ExtensionOfField(allow_null=True)
#     package = PackageSerializer(allow_null=True)
#
#     def create(self, validated_data):
#         return UserPackage.objects.get(**validated_data)
#
#     def update(self, instance, validated_data):
#         return instance
#
#     class Meta:
#         model = UserPackage
#         fields = ('id', 'user', 'package', 'extension_of', 'additional_users', 'additional_months')
#
#
# class UserPackageAccessSerializer(serializers.ModelSerializer):
#     package = UserPackageSerializer()
#
#     def create(self, validated_data):
#         return UserPackageAccess.objects.create(**validated_data)
#
#     def update(self, instance, validated_data):
#         return instance
#
#     class Meta:
#         model = UserPackageAccess
#         fields = ('id', 'user', 'package')
#
#
