from django.shortcuts import render


def registration_form(req):
    return render(req, "registration.html")
