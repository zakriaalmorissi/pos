from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializes.base import BaseCustomUserSerializer
from .serializes.serialize_login import LoginSerializer
from .auth_services import AuthService
from services.permissions import IsAdminOrSuperAdmin
from services.service_layer import *
from rest_framework.decorators import api_view

# The Admin or the owner of a specific business User is gonna be added only by the super admin 
# the normal user is gonna be added by the admin user 


# Function to generate tokens for a user
@api_view(['POST'])
def refresh_token(request):
    try:
        refresh = request.data.get('refresh', None)
        refresh = RefreshToken(refresh)
        # If the refresh token is valid, create a new access token
        return Response({'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)
    


class AddUserView(generics.CreateAPIView):
    """
        Accept only authenticated, admin, super admin role users 
    """
    permission_classes = [IsAdminOrSuperAdmin]
    authentication_classes = [JWTAuthentication]
    serializer_class = BaseCustomUserSerializer


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AuthService.login(**serializer.validated_data)

        return Response(result, status=status.HTTP_200_OK)









    