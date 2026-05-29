from django.urls import path
from .views import *



urlpatterns = [
    path("<int:business_id>/create-order",view=CreateOrderView.as_view()),
    path("<int:business_id>/single-order/<int:order_id>/", view=SingleOrderView.as_view()),
    path("<int:business_id>/list-orders", view=OrdersListView.as_view()),
    path("<int:business_id>/<int:order_id>/create-order-item/", view=CreateOrderItemView.as_view()),
    path("<int:business_id>/<int:order_id>/order-items/", view=ListOrderItemsView.as_view())
]

