from order.models import *
from rest_framework import serializers


class OrderWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["name", "business", "table", "status", "subtotal", "total", "discount", "tax"]
    def update(self, instance:Order, validated_data:dict):
        business = validated_data.pop("business")
        if business:
            instance.business = business
        instance.name = validated_data.get("name", instance.name)
        instance.table = validated_data.get("table", instance.table)
        instance.status = validated_data.get("status", instance.status)
        instance.tax = validated_data.get("tax", instance.tax)
        instance.discount = validated_data.get("discount", instance.discount)
        instance.total =  validated_data.get("total", instance.total)
        instance.subtotal = validated_data.get("subtotal", instance.subtotal)
        instance.is_paid = validated_data.get("is_paid", instance.is_paid)
        return instance.save()





class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
                  "name", "order",
                    "product", "quantity",
                      "unit_price","status", 
                      "note", "delivered",  
                ]



