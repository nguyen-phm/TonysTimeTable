from django.db import models
from authentication.models import CustomUser

class Course(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    coordinator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='coordinated_courses')

class Session(models.Model):
    TYPES = (
        ('LECTURE', 'Lecture'),
        ('TUTORIAL', 'Tutorial'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    type = models.CharField(max_length=10, choices=TYPES)
    date_period = models.CharField(max_length=100)
    instructor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='instructed_sessions')

class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='enrollments')
    date_enrolled = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'session')
