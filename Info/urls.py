from django.urls import path

from . import views

app_name = "info"

urlpatterns = [
    path('home', views.home, name="home"),
    path('about', views.about, name="about"),
    path('faq', views.faq, name="faq"),
    path('schedule', views.schedule, name="schedule"),
]
