from django.shortcuts import render


def home(request):
    return render(request, "home.html", {"user": request.user})


def about(request):
    return render(request, "about.html", {"user": request.user})


def faq(request):
    return render(request, "faq.html", {"user": request.user})


def schedule(request):
    return render(request, "schedule.html", {"user": request.user})
