from rest_framework import serializers
from products.models import Product, ProductVaraint, ModifierGroup, Modifier
from system_config.models import Business




class ProductReadSerializer(serializers.ModelSerializer):
    variants = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ["id", "category", "name", "is_active", "variants"]
    def get_variants(self, obj):
        variants = obj.variants.all()
        if obj.category.business.business_type == Business.BusinessTypes.RESTAURANT or Business.BusinessTypes.CAFE:
            return ProductVaraintRestaurtOrCafeSerializer(variants, many=True).data
        return ProductVaraintsReadSerailizer(variants, many=True).data




class ProductVaraintsReadSerailizer(serializers.ModelSerializer):
    modifier_groups = serializers.SerializerMethodField()
    class Meta:
        model = ProductVaraint
        fields =["id", "business","product", "name", "barcode", "price", "stock_qty", "modifier_groups"]

    def get_modifier_groups(self, obj: ProductVaraint)-> list:
        modifier_groups = obj.modifier_groups.all()
        serializer = ModifierGroupReadSerializer(modifier_groups, many=True)
        return serializer.data



class ProductVaraintRestaurtOrCafeSerializer(serializers.ModelSerializer):
    """"
    Restaurant and cafe are not like stores or shops, so barcode, no stock qauntity
    """
    modifier_groups = serializers.SerializerMethodField()
    class Meta:
        model = ProductVaraint
        fields = ["id", "product", "name", "price", "modifier_groups"]

    def get_modifier_groups(self, obj: ProductVaraint) -> list:
        modifier_groups = obj.modifier_groups.all()
        serializer = ModifierGroupReadSerializer(modifier_groups, many=True)
        return serializer.data
    

class ModifierGroupReadSerializer(serializers.ModelSerializer):
    modifiers = serializers.SerializerMethodField()
    class Meta:
        model = ModifierGroup
        fields = ["id", "business", "product_varaint", "name", "modifiers"]

    def get_modifiers(self, obj: ModifierGroup) -> list:
        modifiers = obj.modifiers.all()
        serializer = ModifiersReadSerializer(modifiers, many=True).data
        return serializer

class ModifiersReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modifier
        fields = "__all__"
