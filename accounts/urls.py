
from django.urls import path
from . import views




urlpatterns = [
    path('setup/', views.system_set_up, name='setup'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    path('create-admin/', views.create_admin_user, name='create_admin'),
    path('list-users/', views.list_users_view, ),
    path('add-user/', views.add_users_view,),
    path('manage-user/<str:username>/', views.manage_user_view)
]