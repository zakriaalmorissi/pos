from django.shortcuts import render
from rest_framework import generics
from services.permissions import IsAdminOrSuperAdmin, IsSuperAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication
from serializers.base import SuperAdminBusinessSerializer, ReadOnlyBusinessSerializer
from rest_framework.views import APIView

# Create your views here.
class CreateBussiness(generics.CreateAPIView):
    permission_classes = [IsSuperAdmin]
    authentication_classes = [JWTAuthentication]
    serializer_class = [SuperAdminBusinessSerializer]



class BusinessView(APIView):
    # Allow anyone who is related to the business itself
    serializer_class = [ReadOnlyBusinessSerializer]
    def get(self, request):
        pass