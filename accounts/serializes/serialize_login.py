from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    device = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs: dict) -> dict:
        if not attrs.get("username") or not attrs.get("password"):
            raise serializers.ValidationError("Username and password are required")
        return attrs