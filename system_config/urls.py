from django.urls import path
from .views import *


urlpatterns = [
    path("create-business/", view=CreateBusiness.as_view()),
    path("business-view/<int:id>/",view=BusinessView.as_view()),

]