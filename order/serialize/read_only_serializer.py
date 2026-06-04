from rest_framework import serializers
from tables.models import Table, TablesGroup
from system_config.models import Business
from order.models import Order, OrderItem
from tables.serializer.read_serialize import _PrivateTableSerializer



class OrderBaseReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "name", "business",
            "is_paid", "status",
            "subtotal", "tax",
            "discount", "total",
            "created_at", "updated_at"
        ]

class OrderRestaurantReadSerializer(OrderBaseReadSerializer):
    table = _PrivateTableSerializer(read_only=True)
    class Meta(OrderBaseReadSerializer.Meta):
        model = Order
        fields = OrderBaseReadSerializer.Meta.fields +["table"] 
        



class BaseOrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "name", "order",
            "product", "quantity",
            "unit_price", "note", 
            "delivered", "total_price"
        ]

class OrderItemRestaurantReadSerializer(BaseOrderItemReadSerializer):
    """
        Service charge and others are gonna be included in the future
    """
    class Meta(BaseOrderItemReadSerializer.Meta):
        fields = BaseOrderItemReadSerializer.Meta.fields + ["status"]