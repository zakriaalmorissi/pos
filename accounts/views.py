from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializer, LoginSerializer, GeneralUserInformationSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from tables import views


from rest_framework.decorators import api_view, permission_classes, authentication_classes
from tables.models import Floor, Table
from .models import CustomUser
from functools import wraps


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Create your views here.

@api_view(["GET"])
def system_set_up(request) -> Response:
    has_floors: bool = Floor.objects.exists()
    has_tables = Table.objects.exists()
    has_users = CustomUser.objects.exists()
    has_admin = CustomUser.objects.filter(is_admin=True).exists()
    has_super_admin = CustomUser.objects.filter(is_superuser=True).exists()


    data = {
        'hasFloors': has_floors,
        'hasTables': has_tables,
        'hasUsers': has_users,
        'hasSuperAdmin': has_super_admin,
        'hasAdmin': has_admin,
    
    }

    return Response(data=data, status=status.HTTP_200_OK)
    


def super_admin_only(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)

        if not request.user.is_superuser:
            return Response({"error": "You must be a super admin"}, status=status.HTTP_403_FORBIDDEN)
        return func(request, *args, **kwargs)
        
    return wrapper

def super_admin_or_admin_access(func): 
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        user: CustomUser = request.user 
        if   user.is_superuser or user.is_admin:
            return func(request, *args, **kwargs)
        print(user.is_superuser)
        return Response({"error": "You must be a super admin or admin"}, status=status.HTTP_403_FORBIDDEN)

    return wrapper

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
    


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }




@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
@super_admin_only
def create_admin_user(request) -> Response:
        name = request.data.get("name", None)
        username = request.data.get("username", None)
        password = request.data.get("password", None)
        is_admin = request.data.get("isAdmin", None)
        device = request.data.get("device", None)
        data = {'name':name, 'username': username, "password": password, "is_admin": is_admin, 'device': device}
        serializer = CustomUserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # authenticate the user 
            user = authenticate(username=username,password=password)
            if user:
                tokens = get_tokens_for_user(user=user)
                return Response(
                   {
                       "tokens": tokens,
                       "user": serializer.data
                   }, status=status.HTTP_200_OK
             )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            


class RegisterView(generics.CreateAPIView):
    serializer_class = CustomUserSerializer
    def post(self, request, *args, **kwargs):
        if not CustomUser.objects.filter(is_superuser=True).exists():
            return self.create_super_user(request=request)
    
        name = request.data.get('name', None)
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        device = request.data.get("device", None)
        data = {"name":name, "username": username, "password": password, 'device': device}
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            user = authenticate(username=username,password=password)
            if user:
                tokens = get_tokens_for_user(user=user)
                return Response(
                   {
                       "tokens": tokens,
                       "user": serializer.data
                   }, status=status.HTTP_200_OK
             )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def create_super_user(self, request) -> Response:
        name = request.data.get("name", None)
        username = request.data.get("username", None)
        password = request.data.get("password", None)
        device = request.data.get("device", None)
        data = {'name':name, 'username': username, "password": password, 'is_superuser': True, 'device': device}
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # authenticate the user 
            user = authenticate(username=username,password=password)
            if user:
                tokens = get_tokens_for_user(user=user)
                return Response(
                   {
                       "tokens": tokens,
                       "user": serializer.data
                   }, status=status.HTTP_200_OK
             )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



  

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serialize =  self.get_serializer(data=request.data)
        serialize.is_valid(raise_exception=True)
        user = serialize.validated_data
        device = request.data.get('device', None)
        if type(device) == dict:
            device = {"device": device.get("hostname", None)}
        else:
            device = {"device": "unknown"}
        serialize_user = CustomUserSerializer(user, data=device, partial=True)
        if serialize_user.is_valid():
            serialize_user.save()
            tokens = get_tokens_for_user(user=user)
            print(serialize_user.data)
            return Response(
                {
                    "tokens": tokens,
                    "user": serialize_user.data
                
                }, status=status.HTTP_200_OK
            )
        print(serialize_user.errors)
        return Response(serialize_user.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@super_admin_or_admin_access
def add_users_view(request): 
    """"
    This is for registering users
    It can be accessed only by super admin or admins 
    """
    name = request.data.get('name', None)
    username = request.data.get("username", None)
    password = request.data.get("password", None)
    is_admin = request.data.get('isAdmin', None)
    data = {"name": name, "username": username, "password":password, "is_admin": is_admin}
    serialize = CustomUserSerializer(data=data)
    if serialize.is_valid():
        serialize.save()
        return Response(serialize.data, status=status.HTTP_200_OK)

    return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET", "PUT", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@super_admin_only
def manage_user_view(request, username) -> Response:
    """
        This is going to perform some users update
        like making a normal user  admin, deleting it
         
    """
    if request.data.get("task", None) == "release table":
        user = CustomUser.objects.get(username=username)
        for table in user.user_tables.all():
           table.user = None
           table.status = "available"
           table.save()
           # Notify the user that his table has been release and fire him out of the table 
        send_release_table(user=user)
        send_user_update(user=user)
        return Response({"data": "Table released Successfully"}, status=status.HTTP_200_OK)
            
    if request.data.pop("task") == "activation":
        user = request.data
        print(user)
        return Response({"data": "changed successfully"}, status=status.HTTP_200_OK)
    return Response({"error": "something went wrong"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_users_view(request) -> Response:
    users = CustomUser.objects.all()
    serializer = GeneralUserInformationSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
    


def send_user_update(user:CustomUser):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "users", 
        {
            "type": "user_update",
            "data": {
                'id': user.pk,
                'name': user.name,
                'username': user.username,
                'device': user.device,
                'is_superuser': user.is_superuser,
                'is_admin': user.is_admin,
                'is_staff': user.is_staff,
                'has_tables': user.has_tables,
                'user_table': user.user_table
               
            }
        }     
    )


def send_release_table(user:CustomUser):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "release_table", 
        {
            "type": "release",
            "data": {
                'id': user.pk,
                'name': user.name,
                'username': user.username,
                'device': user.device,
                'is_superuser': user.is_superuser,
                'is_admin': user.is_admin,
                'is_staff': user.is_staff,
                'has_tables': user.has_tables,
                'user_table': user.user_table,
                'is_active': user.is_active
               
            }
        }     
    )

    