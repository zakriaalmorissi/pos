from .models import *
from decimal import Decimal
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import DetailedSerializeTable
from rest_framework.response import Response
from rest_framework import status
import re


def clean_table_from_empty_bills(table: Table) -> tuple:
    """ 
    Clean the table from empty bill if the user leave the table without any order
    but what if the user created two bills, one has orders while another doesn't have any orders (empty bill)
    """
    if not table.has_orders:
        return table.bills.all().delete()
    # Delete only the bills has no orders
    return table.bills.filter(orders__isnull=True).delete()

def send_table_update(table:Table) -> None:
    # get the table data from here 
    try:
        channel_layer = get_channel_layer()
        data = DetailedSerializeTable(table).data
        safe_data = make_json_safe(data)
        async_to_sync(channel_layer.group_send)(
            "tables",
            {"type": "table.update", "data": safe_data}
        )
    except Exception as e:
        print("send_table_update error:", e)




def make_json_safe(data):
    """
    Recursively convert Decimal and other non-serializable types
    to JSON-safe Python types.
    """
    if isinstance(data, dict):
        return {k: make_json_safe(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_safe(i) for i in data]
    elif isinstance(data, Decimal):
        return float(data)
    return data

def normalize_bill():
    pass

def get_object_or_404(model, id): 
    try:
       return model.objects.get(id = id)
    except model.DoesNotExist: 
        return Response({"error": "Object is not found"}, status=status.HTTP_404_NOT_FOUND)

def camel_to_snake(name: str) -> str:
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1).lower()



def convert_dict_key(data: dict) -> dict:
    return {
        camel_to_snake(key): value for key, value in data.items()
    }