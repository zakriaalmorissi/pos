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
from django.db import transaction
from django.db.models import F
from django.utils import timezone






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
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def move_table_bills_view(request: Request)-> Response:
    data: dict = request.data
    sender_table_id = data.get("senderTable", None)
    receiver_table_id = data.get("receiverTable", None)

    if sender_table_id and receiver_table_id:
        receiver_table = Table.objects.filter(id = receiver_table_id).first()
        sender_table = Table.objects.filter(id=sender_table_id).first()
        if receiver_table and sender_table: 
            sent_bills = Bill.objects.filter(table = sender_table.id)
            for bill in sent_bills: 
                bill.table = receiver_table
                bill.save()
            serailize_receiver_table = SerializeTables(receiver_table)
            # Notify others
            send_table_update(receiver_table)
            send_table_update(sender_table)
            return Response(serailize_receiver_table.data, status=status.HTTP_200_OK)


    return Response({"error": "Faild to move table bills"}, status=status.HTTP_400_BAD_REQUEST)
  


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



# Django complex model ---> Json Layer 
# Django objects     <---  Json layer

# Django ORM <--> drf  S <--> parser  


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_bill(request: Request) -> Response:
    data: dict = request.data
    # Normalize the coming data 
    bill = convert_dict_key(data=data)
    serialize = SerializeBill(data=bill)
    if not serialize.is_valid():
        return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)
    instance = serialize.save()
    table: Table | None = instance.table
    if table:
        serializeTable = SerializeTables(table)
        return Response({"bill": serialize.data, "table": serializeTable.data}, status=status.HTTP_201_CREATED)
    return Response(serialize.data, status=status.HTTP_201_CREATED)
   
    
    

@api_view(["POST", "GET", "DELETE", "PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def bill_view (request: Request, bill_id: int) -> Response: 
    bill = get_object_or_404(Bill, bill_id) 
    if request.method == "PUT":
        # Convert from camel case into snake case
        data: dict = convert_dict_key(request.data)
        serializer = SerializeBill(bill, data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    if request.method == "DELETE":
        delete = bill.delete()
    
    return Response(SerializeBill(bill).data, status=status.HTTP_200_OK)



@api_view(["GET"])
def orders_view(request:Request, bill_id: int) -> Response:
    orders = Order.objects.filter(bill__id = bill_id)
    serializer = SerializeOrder(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST", "DELETE"])
def delete_all_bill_orders(request: Request, bill_id: int)->Response:
    bill = get_object_or_404(Bill, bill_id)
    print(SerializeBill(bill).data)
    orders: list = Order.objects.filter(bill=bill.pk)
    if len(orders): 
        for order in orders:
            order.delete()
        print(f"After deleting all the ordes {SerializeBill(bill).data}")
        return Response({"success": "All orders deleted successfully", "bill": SerializeBill(bill).data})
        




@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@api_view(["GET", "PUT", "DELETE", "POST"])
def single_order_view(request: Request, order_id:int) -> Response:
    order = get_object_or_404(Order, id=order_id)
    print(order)
    data: dict = convert_dict_key(request.data)
    print(data)
    if request.method == "PUT":
        serialize = SerializeOrder(order, data=data, partial = True)
        serialize.is_valid(raise_exception=True)
        saved_order: Order = serialize.save()
        print(saved_order)
        return Response( serialize.data, status=status.HTTP_200_OK)
    
    if request.method == "DELETE":
        try:
            bill = order.bill
            order.delete()
            serialize_bill = SerializeBill(bill)
            # return the calculated bill
            return Response({"success": "Order deleted", "bill": serialize_bill.data}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_order(request: Request) -> Response:
    # Bill related, meaning if any order is created bill must be updated accordingly 
    # Can be table related if the it's come from a table form
    data: dict = request.data
    # Normalize the order 
    order: dict = convert_dict_key(data=data)
    # Get the bill in order to the update its total price 
    created_order = SerializeOrder(data=order)
    created_order.is_valid(raise_exception=True)
    # update the bill 
    order_instance: Order = created_order.save()
    Bill.objects.filter(id = order_instance.bill_id).update(
        total = F("total") + order_instance.total_price,
        updated_at = timezone.now()
    ) 
    return Response(
        {
        "order": created_order.data, 
        "bill": SerializeBill(Bill.objects.get(id=order_instance.bill_id) ).data
        },
        status=status.HTTP_201_CREATED)


def delete_object(request: Request, model: any) -> Response:
    # access the targetted object from the request data
    id: int = request.data.get("id", None)
    try:
        delete = model.objects.get(id=id).delete()
    except model.DoesNotExist:
        return Response({"error": "no object found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"id": f"{id}"}, status=status.HTTP_200_OK)




    
    