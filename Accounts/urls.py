from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path('register', views.registration_form, name="register"),
    path('username/verify', views.verify_username, name="verify_username"),
    path('email/verify', views.verify_email, name="verify_email"),
]
