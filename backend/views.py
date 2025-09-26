from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import *
from .serialize import *
from functools import wraps


# A wrapper for only admin users accessing the view
def admin_only_view(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)
        if not request.user.is_superuser:
            return Response({"detail": "Admin access required."}, status=403)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def home(request) -> Response:
    """
    Gets all categories with proper REST conventions
    """
    categories = Category.objects.all()
    if categories.count() == 0:
        Category.objects.create(name="Food")
    if categories.count() == 1 and categories.first().name == "Food":
        Category.objects.create(name="Drinks")
    serializer = SerializeCategory(Category.objects.all(), many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def menu_view(request): 
    menu = Category.objects.all()
    serialize = SerializeMenu(menu, many=True)
    return Response(serialize.data, status=status.HTTP_200_OK)
    


# --- Parent Items CRUD ---
@api_view(['GET', "POST", "DELETE"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def food_and_drink_view(request, category: str) -> Response:
    category_obj = get_object_or_404(Category, name=category)

    if request.method == "POST":
        return create_food_or_drink(request, category_obj)
    
    if request.method == "DELETE":
        return delete_food_or_drink(request=request)
    

    items = ParentItems.objects.filter(category=category_obj)
    serializer = DetailedSerializeItems(items, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@admin_only_view
def create_food_or_drink(request, category: Category) -> Response:
    data = request.data.copy()
    data["category"] = category.id
    serializer = SerializeParentItems(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@admin_only_view
def delete_food_or_drink(request) -> Response:
    item_id = request.data.get("id")
    if not item_id:
        return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        item = ParentItems.objects.get(id=item_id)
        item.delete()
        return Response({"message": "Deleted successfully"}, status=status.HTTP_202_ACCEPTED)
    except ParentItems.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


# --- Child Items CRUD ---
@api_view(["GET", "POST", "DELETE", "PUT"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def child_items_view(request, parent_id: int) -> Response:
    parent = get_object_or_404(ParentItems, id=parent_id)

    if request.method == "POST":
        return create_child_items(request, parent)
    elif request.method == "DELETE":
        return delete_child_item(request)
    elif request.method == "PUT":
        return update_child_items(request)

    items = ChildItems.objects.filter(category=parent_id)
    serializer = DetailSerializeChildItems(items, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@admin_only_view
def create_child_items(request, parent: ParentItems) -> Response:
    data = request.data.copy()
    data['category'] = parent.id
    serializer = SerializeChildItems(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@admin_only_view
def update_child_items(request) -> Response:
    data = request.data.copy()
    item_id = data.pop("id", None)
    if not item_id:
        return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        item = ChildItems.objects.get(id=item_id)
    except ChildItems.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = SerializeChildItems(item, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@admin_only_view
def delete_child_item(request) -> Response:
    item_id = request.data.get("id")
    if not item_id:
        return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        item = ChildItems.objects.get(id=item_id)
        item.delete()
        return Response({"message": "Deleted successfully"}, status=status.HTTP_202_ACCEPTED)
    except ChildItems.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def condiments_view(request, food_name: str) -> Response:
    try:
        food_item = ChildItems.objects.get(name=food_name)
    except ChildItems.DoesNotExist:
        return Response({"error": "Food does not exist"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        return create_condiments(request, food_item)

    condiments = food_item.components.all()
    if not condiments.exists():
        condiments = Condiments.objects.filter(item=food_item.parent)
    serializer = SerializeCondiments(condiments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@admin_only_view
def create_condiments(request, food: ChildItems) -> Response:
    data = request.data.copy()
    data["item"] = food.id
    serializer = SerializeCondiments(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
