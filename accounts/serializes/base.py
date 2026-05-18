from rest_framework import serializers

from accounts.models import CustomUser



class BaseCustomUserSerializer(serializers.ModelSerializer):
    """""
        This is for public endpoints.
        It's mainly desgined for the user himself who can't modify some critical data
    """
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "name",
            "username",
            "email",
            "phone_number",
            "address",
            "status",
            "role",
            "device",
            "password",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = [
            "id",
            "role",
            "device",
            "is_active",
            "is_staff",
            "is_superuser",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        customUser = CustomUser(**validated_data)

        if password:
            customUser.set_password(password)
        else:
            customUser.set_unusable_password()

        customUser.save()
        return customUser

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    

class AdminCustomUserSerializer(serializers.ModelSerializer):
    "Has the permission to change everything"
    class Meta(BaseCustomUserSerializer.Meta):
        # Override the read_only_fields
        read_only_fields = ["id"]


