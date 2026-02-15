from .models import Order, Table
from .serializers import *
from rest_framework import status
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated 
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request

from accounts.models import CustomUser
from .service_layer import *





@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def floors_view(request: Request) -> Response:
    """"
       1.Retrun all floors with their tables 
       2. handle floors creation, updating and deleting 
       3. 
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

@authentication_classes([JWTAuthentication])  
@permission_classes([IsAuthenticated])
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




@api_view(["POST", "PUT"])
def move_table_bills_view(request: Request)-> Response:
    data: dict = request.data
    sender_table = data.get("senderTable", None)
    receiver_table = data.get("receiverTable", None)
    
    if sender_table and receiver_table: 
        receiver_table = Table.objects.filter(id = receiver_table["id"]).first()
        sender_table = Table.objects.filter(id=sender_table["id"]).first()
        if receiver_table and sender_table: 
            sent_bills = Bill.objects.filter(table = sender_table.id)
            for bill in sent_bills: 
                bill.table = receiver_table
                bill.save()
            serailize_receiver_table = SerializeTables(receiver_table)
            send_table_update(receiver_table)
            send_table_update(sender_table)
            return Response(serailize_receiver_table.data, status=status.HTTP_200_OK)


    # return the tables 
    return Response({"error": "Faild to move table bills"}, status=status.HTTP_200_OK)
  


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
        table = Table.objects.filter(id = serialize.data.get("table")).first()
        print(table)
        print(serialize.data)
        serializeTable = SerializeTables(table)
        return Response({"bill": serialize.data, "table": serializeTable.data}, status=200)
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
    table = Table.objects.get(id=bill.id)
    serializeTable = SerializeTables(table)
    serialize = SerializeBill(bill, data=data, partial=True)
    if serialize.is_valid():
        serialize.save()  
        return Response(serialize.data, status=status.HTTP_200_OK)
    
    return Response({"bill": serialize.data, "table": serializeTable.data}, status=status.HTTP_200_OK)



@api_view(["GET"])
def orders_view(request:Request, bill_id: int) -> Response:
    orders = Order.objects.filter(bill__id = bill_id)
    serializer = SerializeOrder(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@api_view(["GET", "PUT", "DELETE", "POST"])
def single_order_view(request: Request, order_id:int) -> Response:
    if request.method == "PUT":
        return update_order(request=request, id=order_id)
    
    if request.method == "DELETE":
        try:
            order =  Order.objects.get(id=order_id)
            bill = order.bill
            order.delete()
            serialize_bill = SerializeBill(bill)
            # return the calculated bill
            return Response({"success": "Order deleted", "bill": serialize_bill.data}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    




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

    
    serialize = SerializeOrder(get_order, data=data, partial=True)
    if serialize.is_valid():
        serialize.save()
        return Response(serialize.data, status=status.HTTP_200_OK)
    return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)



@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
        serialize.save()
        return Response(serialize.data, status=200)
    return Response(serialize.errors, status=400)




def delete_object(request: Request, model: any) -> Response:
    # access the targetted object from the request data
    id: int = request.data.get("id", None)
    try:
        delete = model.objects.get(id=id).delete()
    except model.DoesNotExist:
        return Response({"error": "no object found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"id": f"{id}"}, status=status.HTTP_200_OK)




    
    