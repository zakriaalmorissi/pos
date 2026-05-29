

from .read_only_serializer import *
from order.models import *
from system_config.models import Business

def order_serializer_class_helper( order:Order, business_type, many=False):
    if business_type in [Business.BusinessTypes.RESTAURANT, Business.BusinessTypes.CAFE]:
        return OrderRestaurantReadSerializer(order, many=many)
    return OrderBaseReadSerializer(order, many=many)
    

def order_item_serailizer_helper(order_item:OrderItem, business_type, many=False):
        if business_type in [Business.BusinessTypes.RESTAURANT, Business.BusinessTypes.CAFE]:
             return OrderItemRestaurantReadSerializer(order_item, many=many)
        return BaseOrderItemReadSerializer(order_item, many=many)
