from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimeSlotViewSet

router = DefaultRouter()
router.register(r'timeslots', TimeSlotViewSet)

urlpatterns = [
    path('', include(router.urls)),
]