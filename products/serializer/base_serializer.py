from rest_framework import serializers
from products.models import *
from .productSerializer.read_only import ProductReadSerializer




class CatalogReadSerializer(serializers.ModelSerializer):
    products = ProductReadSerializer(read_only=True, many=True)
    class Meta:
        model =  Category
        fields = ["id", "business", "name", "products"]

        
