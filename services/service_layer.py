from accounts.models import *

from decimal import Decimal
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.response import Response
from rest_framework import status
import re




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


def camel_to_snake(name: str) -> str:
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1).lower()



def convert_dict_key(data: dict) -> dict:
    return {
        camel_to_snake(key): value for key, value in data.items()
    }