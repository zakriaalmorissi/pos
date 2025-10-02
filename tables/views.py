from .models import Order, Table
from accounts.views import send_user_update
from .serializers import *
from rest_framework import status
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated 
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.request import Request

from accounts.models import CustomUser

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def floors_view(request: Request) -> Response:
    """"
    Return all values and handle floor creations
    """
    if request.method == "POST":
        data: dict = request.data
        return validate_and_create_floor(data=data)
    # Order the floors by their created time 
    floors = Floor.objects.all()
    serialize = SerializeFloor(floors, many=True)

    
    return Response(serialize.data, status=200)

def validate_and_create_floor(data: dict) -> Response:
    name: str | None = data.get("name", None)
    if name:
        name = name.title().strip()
        # Override the floor name in the data dict 
        data['name'] = name
        serialize = SerializeFloor(data=data)
        if serialize.is_valid():
            serialize.save()
            return Response(serialize.data, status=200)
        else:
            name_error: list = serialize.errors.get("name", None)
            if name_error:
                return Response({'error': name_error[0]}, status=status.HTTP_400_BAD_REQUEST)
            # This condition must be handled as well -> else if or else 
    return Response({"error": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)
    
    



@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def all_tables_view(request: Request) -> Response:
    """""
    Return Tables related To the targeted floor 
    """
    # filtering the table by the id floor 
    tables = Table.objects.all()
    serialize = SerializeTables(tables, many=True)
    return Response(serialize.data)



    

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def tables_view(request: Request, floor_id: int) -> Response:
    """""
    Return Tables related To the targeted floor 
    """
    # filtering the table by the id floor 
    tables = Table.objects.filter(floor__id = floor_id)
    serialize = SerializeTables(tables, many=True)
    return Response(serialize.data)



@api_view(['POST'])
def create_table(request: Request, floor_id: int)-> Response:
    data: dict = request.data
    # Overide the provided data providing the floor id that the table is gonna relate to 
    data['floor'] = floor_id 
    
    serializer = SerializeTables(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    
    else:
        unique_name_error: list = serializer.errors.get("name", None)
        if unique_name_error:
            return Response({"error": unique_name_error[0]}, status=400)
        return Response({"error": "Invalid data", "message": serializer.errors}, status=400)

     

@api_view(['POST', 'GET'])
def single_table_view(request: Request, id: int) -> Response:
    """"
    Return the targeted table with all its related bills, and also handle deleting and updating  tables
    """
    if request.method == "POST":
        data: dict = request.data
        return update_table_data(data=data)
    
    table = Table.objects.get(id=id)
    serialize = DetailedSerializeTable(table)
    return Response(serialize.data) 

def update_table_data(data: dict) -> Response:
    """"
    Validate Table data 
    """
    table = Table.objects.filter(**data).first()
    
    serialize = SerializeTables(table,data=data, partial= True)
    if serialize.is_valid():
        serialize.save()
        return Response(data=serialize.data, status=status.HTTP_200_OK)
    
    return Response(serialize.errors, status=400)



# Real time updates
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def occupy_table (request: Request, table_id: int): 
    table = Table.objects.get(id=table_id)
    status = table.status
    if status.strip() == "available":
        table.status = "occupied"
        table.user = CustomUser.objects.filter(username = request.user.username).first()
        table.save()
        send_table_update(table=table)
        send_user_update(user=request.user)
        return Response({"data": "Table status occupied successfully"}, status=200)
    return Response({"error": "Table status alreedy occupied"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def release_table (request: Request, table_id: int)-> Response:
    table = Table.objects.get(id=table_id)
    if table.status == "occupied": 
        table.status = "available"
        table.user = None
        clean_table_from_empty_bills(table=table)
        table.save()
        send_user_update(user=request.user)
        send_table_update(table=table)
        return Response({"data": "Table status released successfully"}, status=200)
    return Response({"error": "Table status alreedy released"}, status=400)

def clean_table_from_empty_bills(table: Table) -> tuple:
    """ 
    Clean the table from empty bill if the user leave the table without any order
    but what if the user created two bills, one has orders while another doesn't have any orders (empty bill)
    """
    if not table.has_orders:
        return table.bills.all().delete()
    # Delete only the bills has no orders
    return table.bills.filter(orders__isnull=True).delete()

def send_table_update(table: Table) -> None:
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "tables",
        {
            "type": "table.update",
            "data": {
                "id": table.id,
                "floor": table.floor.id,
                "name": table.name,
                "status": table.status, 
                "has_orders": table.has_orders,
                "bill_ids": table.bill_ids,
                "counted_bills": table.counted_bills
            }
        }
    )
    

@api_view(["DELETE"])
def delete_table(request: Request, id: int) -> Response:    
    try:
       table = Table.objects.get(id = id).delete()

    except Table.DoesNotExist:
        return Response({"error": "Faild to delete"}, status=400)
    
    data = {"message": f"table with the id {table[0]} has been deleted"}
    
    return Response(data=data, status=status.HTTP_200_OK)


@api_view(["GET"])
def take_out_bills_view(request:Request):
    """
    This function is gonna list all bills that has no any related table 
    These bills are only all gonna have take out orders 
    """

    bills = Bill.objects.filter(table=None)
    serialize = SerializeBill(bills, many=True)
    return Response(serialize.data, status=status.HTTP_200_OK)



@api_view(["POST"])
def create_bill(request: Request) -> Response:
    data: dict = request.data
    serialize = SerializeBill(data=data)
    if serialize.is_valid():
        serialize.save()
        return Response(serialize.data, status=200)
    return Response(serialize.errors, status=400)
    


@api_view(["POST", "GET", "DELETE", "PUT"])
def bill_view (request: Request, bill_id: int) -> Response: 
    # this is gonna return the bill info
    try:
        bill = Bill.objects.get(id=bill_id)
    except Bill.DoesNotExist:
        return Response({"error": "Object not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        return update_bill(request=request, bill=bill)
    
    serialize = SerializeBill(bill)
    return Response(serialize.data)


def update_bill(request: Request, bill)-> Response: 
    data: dict = request.data
    serialize = SerializeBill(bill, data=data, partial=True)
    if serialize.is_valid():
        serialize.save()        
        print(data)
        return Response(serialize.data, status=status.HTTP_200_OK)
    
    return Response({"success": "updated"})



@api_view(["GET"])
def orders_view(request:Request, bill_id: int) -> Response:
    orders = Order.objects.filter(bill__id = bill_id)
    serializer = SerializeOrder(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["GET", "PUT", "DELETE", "POST"])
def single_order_view(request: Request, order_id:int) -> Response:
    if request.method == "PUT":
        return update_order(request=request, id=order_id)
    

    if request.method == "DELETE":
        # Update the bill total price 
        try:
            order =  Order.objects.get(id=request.data.get("id", None))
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        bill = order.bill
        delete = delete_object(request=request, model=Order)
        if delete.status_code == 200:
            bill.total =  bill.total - order.price
            bill.save()
            return delete
        return Response({"error":"Unexpected Error"}, status=status.HTTP_400_BAD_REQUEST)

    




def update_order(request: Request, id:int) -> Response:
    try:
        get_order = Order.objects.get(id=id)
    except Order.DoesNotExist:
        return Response({"error": "object does not exist"}, status=status.HTTP_404_NOT_FOUND)
    
    data: dict = request.data
    condiments = data.get('condiments', None)
    if (condiments):
        condiments += get_order.condiments 
        data['condiments'] = condiments
    # Chick if comdiment already exists in the order or not 

    
    bill = Bill.objects.get(id=get_order.bill.id)
    
    serialize = SerializeOrder(get_order, data=data, partial=True)
    if serialize.is_valid():
        # Store the old price 
        old_price = (get_order.price * get_order.quantity)
        new_order = serialize.save()
        # Store the new price
        new_price  = (new_order.price * new_order.quantity)
        bill.total = bill.total - old_price + new_price
        bill.save()
      
        return Response(serialize.data, status=status.HTTP_200_OK)
    return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)





@api_view(["POST"])
def create_order(request: Request) -> Response:
    # Update the bill price along with creating the price 
    id = request.data.get('id', None)
    name = request.data.get('name', None)
    price = request.data.get("price", None)
    bill_id = request.data.get('bill', None)
    order_status = request.data.get("status", None)
        
    # Get the table in order to update its status once the order gets created 
    table_id: int | None = request.data.pop('table', None)
    
    if table_id:
        try: 
            table = Table.objects.get(id=table_id)
        except Table.DoesNotExist:
            return Response({"error": "Table does not exist"}, status=400)
    
    
    # Get the bill in order to the update its total price 
    try:
        bill = Bill.objects.get(id=bill_id)
    except Bill.DoesNotExist:
        return Response({"error": "Bill does not exist"},  status=status.HTTP_404_NOT_FOUND)
    
    serialize = SerializeOrder(data={
        "id": id, "food_name": name, 
        "price": price, "bill": bill.pk,
        "status": order_status 
    })
    
    if serialize.is_valid():
        order = serialize.save()
        # Update the total price of the bill 
        bill.total = bill.total + order.price * order.quantity
        bill.save()
        # Notify the user that the already upd`ated and has got some orders
        if table_id:
            send_table_update(table=table)
        return Response(serialize.data, status=200)
    print(serialize.errors)
    return Response(serialize.errors, status=400)




def delete_object(request: Request, model: any) -> Response:
    # access the targetted object from the request data
    id: int = request.data.get("id", None)
    try:
        delete = model.objects.get(id=id).delete()
    except model.DoesNotExist:
        return Response({"error": "no object found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"id": f"{id}"}, status=status.HTTP_200_OK)

