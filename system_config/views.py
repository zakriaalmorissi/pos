from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from services.permissions import IsAdminOrSuperAdmin, IsSuperAdmin, CanAccessBusiness
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from .serializers.base import SuperAdminBusinessSerializer, ReadOnlyBusinessSerializer
from rest_framework.views import APIView
from .models import Business
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class CreateBusiness(generics.CreateAPIView):
    permission_classes = [IsSuperAdmin]
    authentication_classes = [JWTAuthentication]
    serializer_class = SuperAdminBusinessSerializer


class BusinessView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,CanAccessBusiness]
    serializer_class = ReadOnlyBusinessSerializer

    def get_object(self):
        return get_object_or_404(
            Business,
            id=self.kwargs["id"]
        )

    def get(self, request, id):
        obj = self.get_object()
        self.check_object_permissions(request, obj)

        serializer = self.serializer_class(obj)
        return Response(serializer.data)
        