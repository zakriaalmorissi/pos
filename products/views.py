from django.shortcuts import render
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer.base_serializer import CatalogReadSerializer

# Create your views here.

class CatelogView(APIView):
    """
        Read only catelog 
    """
    serializer_class = CatalogReadSerializer

    def get(self, request):
        categories = Category.objects.all()
        serialize = self.serializer_class(categories, many=True)
        return Response(serialize.data)
        
        
