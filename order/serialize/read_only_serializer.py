from rest_framework import serializers
from tables.models import Table, TablesGroup
from system_config.models import Business
from order.models import Order, OrderItem
from tables.serializer.read_serialize import _PrivateTableSerializer



class OrderBaseReadSerializer(serializers.ModelSerializer):
    order_items_length = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = [
            "id",
            "name", "business",
            "is_paid", "status",
            "subtotal", "tax",
            "discount", "total",
            "order_items_length",
            "created_at", "updated_at",
            
        ]
    def get_order_items_length(self, obj):
        count = obj.order_items.count()
        return count


class OrderRestaurantReadSerializer(OrderBaseReadSerializer):
    table = _PrivateTableSerializer(read_only=True)
    class Meta(OrderBaseReadSerializer.Meta):
        model = Order
        fields = OrderBaseReadSerializer.Meta.fields +["table", "service_charge"] 

        # also include service charge 
        



class BaseOrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "name", "order",
            "product", "quantity",
            "unit_price", "note", 
            "delivered", "total_price",
            "created_at", "updated_at"
        ]

class OrderItemRestaurantReadSerializer(BaseOrderItemReadSerializer):
    """
        Service charge and others are gonna be included in the future
    """
    order = OrderRestaurantReadSerializer(read_only=True)
    class Meta(BaseOrderItemReadSerializer.Meta):
        fields = BaseOrderItemReadSerializer.Meta.fields + ["status"]