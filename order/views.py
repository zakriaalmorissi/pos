
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Order, OrderItem
from system_config.models import Business

from .serialize.write_only_serializer import (
    OrderWriteSerializer,
    OrderItemWriteSerializer,
)

from .serialize.serializer_service import (
    order_serializer_class_helper,
    order_item_serailizer_helper,
)

from services.service_layer import convert_dict_key


class BaseBusinessView(APIView):
    def get_business(self, business_id):
        return get_object_or_404(Business, id=business_id)

    def get_order(self, business_id, order_id):
        return get_object_or_404(
            Order,
            id=order_id,
            business_id=business_id
        )


class CreateOrderView(BaseBusinessView):
    serializer_class = OrderWriteSerializer

    def post(self, request, business_id):
        business = self.get_business(business_id)

        data = convert_dict_key(request.data)
        data["business"] = business.id

        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save()

        response_serializer = order_serializer_class_helper(
            order=order,
            business_type=business.business_type
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class SingleOrderView(BaseBusinessView):

    def get(self, request, business_id, order_id):
        business = self.get_business(business_id)
        order = self.get_order(business_id, order_id)

        serializer = order_serializer_class_helper(
            order=order,
            business_type=business.business_type
        )

        return Response(serializer.data)

    def put(self, request, business_id, order_id):
        business = self.get_business(business_id)
        order = self.get_order(business_id, order_id)

        data = convert_dict_key(request.data)

        serializer = OrderWriteSerializer(
            order,
            data=data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        updated_order = serializer.save()

        response_serializer = order_serializer_class_helper(
            order=updated_order,
            business_type=business.business_type
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )


class OrdersListView(BaseBusinessView):
    """
    Return all orders for a business.
    """

    def get(self, request, business_id):
        business = self.get_business(business_id)

        orders = business.order_set.all()

        serializer = order_serializer_class_helper(
            order=orders,
            many=True,
            business_type=business.business_type
        )

        return Response(serializer.data)


class CreateOrderItemView(BaseBusinessView):
    serializer_class = OrderItemWriteSerializer

    def post(self, request, business_id, order_id):
        business = self.get_business(business_id)
        order = self.get_order(business_id, order_id)
        data = convert_dict_key(request.data)
        data["note"] = ""
        data["order"]= order.id
        serializer = self.serializer_class(data=data)

        if not serializer.is_valid():
            print(serializer.errors)
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

        order_item = serializer.save()

        response_serializer = order_item_serailizer_helper(
            order_item=order_item,
            business_type=business.business_type
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class ListOrderItemsView(BaseBusinessView):

    def get(self, request, business_id, order_id):
        business = self.get_business(business_id)
        order = self.get_order(business_id, order_id)
        ors = OrderItem.objects.all()
        print(ors)
        print(order_id)

        order_items = order.order_items.all()
        print(order_items)

        serializer = order_item_serailizer_helper(
            order_item=order_items,
            many=True,
            business_type=business.business_type
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

