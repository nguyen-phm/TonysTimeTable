# Generated by Django 5.0.7 on 2024-08-01 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeslot',
            name='lecturer',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='timeslot',
            name='period',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='timeslot',
            name='venue',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
