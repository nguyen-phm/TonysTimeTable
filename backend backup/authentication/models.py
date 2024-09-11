from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

class CustomUser(AbstractUser):
    university_email = models.EmailField(unique=True)
    personal_email = models.EmailField(unique=True)
    is_student = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)

    def clean(self):
        if not self.pk:
            # need change later
            if self.university_email.endswith('student.sth.edu.au'):
                self.is_student = True
            elif self.university_email.endswith('sth.edu.au'):
                self.is_teacher = True
            else:
                raise ValidationError("invalid university email")
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    # You can add any additional fields or methods here

    def __str__(self):
        return self.university_email