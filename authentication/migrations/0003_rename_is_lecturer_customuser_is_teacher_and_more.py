# Generated by Django 5.1 on 2024-09-01 11:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_customuser_is_lecturer_customuser_is_student_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='is_lecturer',
            new_name='is_teacher',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='is_tutor',
        ),
    ]
