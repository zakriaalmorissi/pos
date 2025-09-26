from django.urls import path
from . import views




from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView  # Using default implementation

urlpatterns = [
    # --- Authentication ---
    path("api/token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path("menu-view/", views.menu_view),
    path("categories/", views.home, name='category_list'),
    path(
        "parent-items/<str:category>/",  # Consistent URL pattern
        views.food_and_drink_view,
        name='parent_items_management'
    ),
    path(
        "child-items/<int:parent_id>/",  # Fixed missing closing angle bracket
        views.child_items_view,
        name='child_items_management'
    ),
    path("condiments-items/<str:food_name>/", views.condiments_view,),

    
]