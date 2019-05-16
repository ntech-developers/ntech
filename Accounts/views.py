from django.http import JsonResponse
from django.shortcuts import render

from Info.models import Institution, Country
from .models import Participant


def registration_form(req):
    return render(req, "registration.html", {"institutions": Institution.objects.all(),
                                             "countries": Country.objects.all()})


def verify_username(req):
    #  Checks whether a username is taken
    #  returns a json response for use with ajax requests
    #  the username is passed through GET
    username = req.GET.get("username", "")
    return JsonResponse({"exists": Participant.objects.filter(username=username).exists()})


def verify_email(req):
    #  Checks whether a email is taken
    #  returns a json response for use with ajax requests
    #  the email is passed through GET
    email = req.GET.get("email", "")
    return JsonResponse({"exists": Participant.objects.filter(email=email).exists()})
