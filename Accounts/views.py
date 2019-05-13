from django.shortcuts import render

from Info.models import Institution


def registration_form(req):
    return render(req, "registration.html", {"institutions": Institution.objects.all()})
