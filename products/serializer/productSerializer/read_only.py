from rest_framework import serializers
from products.models import Product, ProductVariant, ModifierGroup, Modifier
from system_config.models import Business
from services.serializing_helper import get_serialized_product_variants




class ProductReadSerializer(serializers.ModelSerializer):
    variants = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ["id", "category", "name", "is_active", "variants"]
    def get_variants(self, obj):
        return get_serialized_product_variants(obj)


class ModifiersReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modifier
        fields = "__all__"
 


class ModifierGroupReadSerializer(serializers.ModelSerializer):
    modifiers = ModifiersReadSerializer(many=True, read_only=True)
    class Meta:
        model = ModifierGroup
        fields = ["id", "business", "product_Variant", "name", "modifiers"]

    def get_modifiers(self, obj: ModifierGroup) -> list:
        modifiers = obj.modifiers.all()
        serializer = ModifiersReadSerializer(modifiers, many=True).data
        return serializer
    
class BaseProductVariantsReadSerializer(serializers.ModelSerializer):
    modifier_groups = ModifierGroupReadSerializer(read_only=True, many=True)


class ProductVariantsReadSerailizer(BaseProductVariantsReadSerializer):
    class Meta:
        model = ProductVariant
        fields =["id", "business","product", "name", "barcode", "price", "stock_qty", "modifier_groups"]



class ProductVariantRestaurantSerializer(BaseProductVariantsReadSerializer):
    """"
    Restaurant and cafe are not like stores or shops, so barcode, no stock qauntity
    """
    class Meta:
        model = ProductVariant
        fields = ["id", "product", "name", "price", "modifier_groups"]
    