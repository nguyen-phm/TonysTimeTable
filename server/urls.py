from django.contrib import admin
from django.urls import re_path
from . import views
urlpatterns = [
    #re_path('admin/', admin.site.urls),

    re_path('login', views.log_in),
    re_path('signup', views.sign_up),
    re_path('testtoken', views.test_token),
]
