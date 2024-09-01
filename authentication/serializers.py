from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = CustomUser
        fields = ["id", "username", "password", "university_email", "personal_email", "is_student", "is_teacher", "is_tutor"]
        read_only_fields = ["is_student", "is_teacher", "is_tutor"]