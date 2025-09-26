from django.urls import path
from . import views



app_name = "tables"
urlpatterns = [
    path(route='floors/', view=views.floors_view),
    path(route="all-tables/", view=views.all_tables_view),
    path(route="tables/<int:floor_id>/", view=views.tables_view,),
    path(route="create_table/<int:floor_id>/", view=views.create_table ),
    path(route='table/<int:id>/', view=views.single_table_view),
    path(route="delete_table/<int:id>/", view=views.delete_table,),
    path(route='occupy_table/<int:table_id>/', view=views.occupy_table),
    path(route='release_table/<int:table_id>/', view=views.release_table)
]


urlpatterns += [
    path(route="create-bill/", view=views.create_bill),
    path(route='bill/<int:bill_id>/', view=views.bill_view,),
    path(route="bills/", view=views.take_out_bills_view)
]

urlpatterns += [
    path(route="orders-view/<int:bill_id>/", view=views.orders_view),
    path(route="order-view/<int:order_id>/", view=views.single_order_view),
    path(route="create-order/", view=views.create_order),
]