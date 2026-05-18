from rest_framework import serializers
from products.models import *
from .productSerializer.read_only import ProductReadSerializer




class CatalogReadSerializer(serializers.ModelSerializer):
    business = serializers.PrimaryKeyRelatedField(queryset=Business.objects.all())
    products = serializers.SerializerMethodField()
    class Meta:
        model =  Category
        fields = ["id", "business", "name", "products"]
    def get_products(self, obj):
        products = obj.products.all()
        return ProductReadSerializer(products, many=True).data

        
