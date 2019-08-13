from django.core import serializers
from django.http import JsonResponse, Http404, HttpResponseForbidden
from django.shortcuts import render

from .forms import EventForm
from .models import Event, Country


def home(request):
    return render(request, "home.html", {"user": request.user})


def about(request):
    return render(request, "about.html", {"user": request.user})


def faq(request):
    return render(request, "faq.html", {"user": request.user})


def schedule(request):
    if request.is_ajax():
        if request.POST:
            # Security enforcement for sensitive operations
            if not request.user.is_authenticated or not request.user.is_staff:
                return HttpResponseForbidden("Authentication needed!")
            # If pk (model object identifier) in POST then this is an update request
            if request.POST.get("pk"):
                event = Event.objects.filter(pk=request.POST.get("pk"))
                # Check whether said pk even exists if not slap the request with a 404 error
                if event.exists():
                    # Check for del key and if it exists delete the event
                    if request.POST.get("del"):
                        event.delete()
                        return JsonResponse({"success": True})
                    else:
                        form = EventForm(request.POST, instance=event[0])
                        if form.is_valid():
                            form.save()
                            return JsonResponse({"success": True})
                else:
                    raise Http404
            else:
                # pk is missing then this must be a creation request
                form = EventForm(request.POST)
                if form.is_valid():
                    form.save()
                    return JsonResponse({"success": True})
                return JsonResponse({"success": False})
        else:
            events = Event.objects.all().order_by('start_date', 'start_time')
            return JsonResponse({"events": serializers.serialize('json', events)})

    return render(request, "schedule.html", {"user": request.user, "countries": Country.objects.all()})
