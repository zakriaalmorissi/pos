from django.shortcuts import render
from .serialize.write_only_serializer import OrderWriteSerializer, OrderItemWriteSerializer
from rest_framework.views import APIView
from .models import *
from rest_framework import status
from django.shortcuts import get_object_or_404, get_list_or_404

from rest_framework.response import Response
from system_config.models import Business
# Create your views here.
from services.service_layer import convert_dict_key
from .serialize.serializer_service import order_item_serailizer_helper, order_serializer_class_helper

class CreateOrderView(APIView):
    serializer_class = OrderWriteSerializer
    def post(self, request, business_id):
        data = convert_dict_key(request.data)
        business = get_object_or_404(id=business_id, klass=Business)
        data["business"] = business.id
        create_order = self.serializer_class(data=data)
        create_order.is_valid(raise_exception=True)
        # Return the object based on the system type 
        order = create_order.save()
        serialized_order = order_serializer_class_helper(order=order, business_type=business.business_type)
        print(serialized_order.data)
        return Response(serialized_order.data, status=status.HTTP_201_CREATED)



class SingleOrderView(APIView):
    
    def get(self, request, business_id, order_id):
        business = get_object_or_404(Business, id=business_id)
        order = self.get_order(id=order_id)
        data = self.serialized_order(order=order, business=business).data
        return Response(data=data, status=status.HTTP_200_OK)


    def put(self, request, business_id, order_id):
        business = get_object_or_404(Business, id=business_id)
        order = self.get_order(id=order_id)
        update_order = OrderWriteSerializer(order, request.data, partial=True)
        if not update_order.is_valid():
            print(update_order.error_messages)
            return Response({"status": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

        new_order = update_order.save()
        serializer = order_serializer_class_helper(new_order, business_type=business.business_type)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def get_order(self, id):
        order = get_object_or_404(Order, id=id)
        return order
    
    def serialized_order(self, order, business):
        return order_serializer_class_helper(
            order=order,
            business_type=business.business_type
            )


class OrdersListView(APIView):
    """"
        Get the orders of the related business
    """
    def get(self, request, business_id):
        business = get_object_or_404(id=business_id, klass=Business)
        orders = business.order_set.all()
        serializer = order_serializer_class_helper(orders, many=True, business_type=business.business_type)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateOrderItemView(APIView):
    serializer_class = OrderItemWriteSerializer
    def post(self, request, business_id, order_id):
        business = get_object_or_404(Business, id=business_id)
        data = request.data
        create_order_item = self.serializer_class(data=data)
        create_order_item.is_valid(raise_exception=True)
        order_item = create_order_item.save()
        serializer = order_item_serailizer_helper(order_item=order_item, business_type=business.business_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    


class ListOrderItemsView(APIView):
    def get(self, request, business_id, order_id):

        business = get_object_or_404(Business, id=business_id)
        order_items = OrderItem.objects.filter(order=order_id)
  
   

        serializer = order_item_serailizer_helper(
            order_item=order_items,
            many=True,
            business_type=business.business_type
        )

        return Response(serializer.data, status=status.HTTP_200_OK)






