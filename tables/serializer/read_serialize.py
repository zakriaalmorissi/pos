from rest_framework import serializers
from tables.models import TablesGroup, Table, TableStatus

class TableStatusReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableStatus
        fields = "__all__"

class TableReadSerializer(serializers.ModelSerializer):
    status = TableStatusReadSerializer(read_only=True)
    class Meta:
        model = Table
        fields = ["id", "group", "name", "user", "updated_at", "status"]


class TablesGroupReadSerializer(serializers.ModelSerializer):
    tables = TableReadSerializer(many=True, read_only=True)
    class Meta:
        model = TablesGroup
        fields = ["id", "name", "business", "tables_type", "tables"]


