from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_student', 'is_teacher']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('is_student', 'is_teacher')}),
    )
admin.site.register(CustomUser, CustomUserAdmin)