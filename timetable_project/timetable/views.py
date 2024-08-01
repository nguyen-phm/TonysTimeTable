from django.shortcuts import render
from rest_framework import viewsets
from .models import TimeSlot
from .serializers import TimeSlotSerializer

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer