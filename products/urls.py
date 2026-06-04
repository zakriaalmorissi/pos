from django.urls import path
from .views import *



urlpatterns = [
    path("catalog-view/", view=CatelogView.as_view())
]