from system_config.models import Business
from products.models import Product, ProductVariant

def get_serialized_product_variants(product:Product) -> list[dict]:
    variants = product.variants.all()
    business: Business = product.category.business
    if business.business_type in [ Business.BusinessTypes.RESTAURANT, Business.BusinessTypes.CAFE]:
        from products.serializer.productSerializer.read_only import (
            ProductVariantRestaurantSerializer, 
            ProductVariantsReadSerailizer)

        return ProductVariantRestaurantSerializer(variants, many=True).data
    return ProductVariantsReadSerailizer(variants, many=True).data


