from order.models import *
from rest_framework import serializers


class OrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["name", "business", "table", "status", "subtotal", "total", "discount", "tax"]






class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
                  "name", "order",
                    "product", "qauntity",
                      "unit_price","status", 
                      "note", "delivered",  
                ]



