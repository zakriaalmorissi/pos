
from django.urls import path
from . import views




urlpatterns = [
    path('add-user/', views.AddUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', views.refresh_token, name='refresh_token'),
  
]