from django.urls import path
from .views import *



urlpatterns = [
    path("catelog/", view=CatelogView.as_view())
]