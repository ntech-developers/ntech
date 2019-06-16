from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name="login"),
    path('register', views.registration_form, name="register"),
    path('logout', views.log_out, name="logout"),
    path('username/verify', views.verify_username, name="verify_username"),
    path('email/verify', views.verify_email, name="verify_email"),
    path('preauth', views.pre_authenticate, name="pre_authenticate"),
    path('profile/', views.profile, name="profile"),
    path('profile/image', views.upload_profile_image, name="profile_image"),
    path('password/reset', views.password_reset, name="password_reset"),
]
