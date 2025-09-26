from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework.validators import UniqueValidator



class GeneralUserInformationSerializer(serializers.ModelSerializer):
    # Provide read-only access to the user information
    class Meta:
        model = CustomUser
        fields = ['id', 'name','username', 'device', 'is_superuser','is_admin' ,'is_staff', 'has_tables', 'user_table', 'is_active']
        read_only_fields = ['id','name','username', 'device', 'is_superuser']



class CustomUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20, required=True,
                                        validators=[UniqueValidator(queryset=CustomUser.objects.all(),
                                                                message='A user with that username already exists.')],
                                     )
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'username','device', 'status', 'is_superuser', 'password', 'is_admin',]
        exra_kwargs = {
            'password': {'write_only': True},
            'device': {'required': False, 'allow_blank': True},
            'status': {'required': False, 'default': 'available'},
            'is_superuser': {'read_only': True}
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        instance.is_admin = validated_data.get('is_admin', instance.is_admin)
        instance.name = validated_data.get('name', instance.name)
        instance.device = validated_data.get('device', instance.device)
        instance.status = validated_data.get('status', instance.status)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        instance.save()
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            instance.save()
        # Return the updated instance
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate(self, data)-> CustomUser:
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            raise serializers.ValidationError("Username and password are required")
        user = authenticate(username=username, password=password)  
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        return user
    
    def update(self, instance, validated_data):
        instance.device = validated_data.get('device', instance.device)
        instance.save()
        return instance