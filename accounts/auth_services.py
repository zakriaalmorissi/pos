# auth/services.py

from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

class AuthService:
    @staticmethod
    def login(username: str, password: str, device: str | None = None):
        user = authenticate(username=username, password=password)

        if user is None:
            raise AuthenticationFailed("Invalid credentials")

        if not user.is_active:
            raise AuthenticationFailed("User is inactive")

        # update device
        if device:
            user.device = device
            user.save(update_fields=["device"])

        # generate tokens
        refresh = RefreshToken.for_user(user)

        # add custom claims (VERY important for scaling)
        refresh["role"] = user.role
        refresh["device"] = user.device

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "device": user.device,
            }
        }