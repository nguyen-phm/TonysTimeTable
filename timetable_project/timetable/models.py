from django.db import models

class TimeSlot(models.Model):
    DAY_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]

    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    subject = models.CharField(max_length=100)
    venue = models.CharField(max_length=100, null=True, blank=True)
    lecturer = models.CharField(max_length=20, null=True, blank=True)
    period = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_day_display()} - {self.subject}"