from .serializer.read_serialize import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *




class TablesGroupView(APIView):
    serializer_class = TablesGroupReadSerializer
    def get(self, request):
        tables = TablesGroup.objects.all()
        serialize = self.serializer_class(tables, many=True)
        return Response(serialize.data, status=status.HTTP_200_OK)