from rest_framework import serializers
from tables.models import TablesGroup, Table, TableStatus


class TableStatusReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableStatus
        fields = "__all__"

class TableReadSerializer(serializers.ModelSerializer):
    status = TableStatusReadSerializer(read_only=True)
    orders = serializers.SerializerMethodField()
    counted_orders  = serializers.SerializerMethodField()
    class Meta:
        model = Table
        fields = ["id", "group", "name", "user", "updated_at", "status", "orders", "counted_orders"]

    def get_counted_orders(self, obj):
        count = obj.orders.count()
        return count
    
    def  get_orders(self, obj):
        from order.serialize.read_only_serializer import OrderRestaurantReadSerializer
        orders = obj.orders.all()
        return OrderRestaurantReadSerializer(orders, many=True).data



class TablesGroupReadSerializer(serializers.ModelSerializer):
    tables = TableReadSerializer(many=True, read_only=True)
    class Meta:
        model = TablesGroup
        fields = ["id", "name", "business", "tables_type", "tables"]

  
class _PrivateTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = [
            "id","name", "group", "user", "updated_at", "status"
        ]
    


    


