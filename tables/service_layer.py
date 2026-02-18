from .models import *
from decimal import Decimal
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import DetailedSerializeTable


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
