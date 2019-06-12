from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render, redirect

from .forms import SignUpForm, UserUpdateForm, ProfileUpdateForm, PasswordChangeForm


def registration_form(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.refresh_from_db()  # hard refresh load the profile instance created by the signal
            user.profile.language = form.cleaned_data.get('language')
            user.profile.mobile = form.cleaned_data.get('mobile')
            user.profile.skills = form.cleaned_data.get('skills')
            user.profile.institution = form.cleaned_data.get('institution')
            user.profile.gender = form.cleaned_data.get('gender')
            user.profile.country = form.cleaned_data.get('country')
            user.profile.date_of_birth = form.cleaned_data.get('date_of_birth')
            user.save()
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=user.username, password=raw_password)
            login(request, user)
            return redirect('info:home')
        print(form.errors)
    else:
        form = SignUpForm()
    return render(request, 'registration.html', {'form': form})


def verify_username(request):
    #  Checks whether a username is taken
    #  returns a json response for use with ajax requests
    #  the username is passed through GET
    username = request.GET.get("username", "")
    return JsonResponse({"exists": User.objects.filter(username=username).exists()})


def verify_email(request):
    #  Checks whether a email is taken
    #  returns a json response for use with ajax requests
    #  the email is passed through GET
    email = request.GET.get("email", "")
    return JsonResponse({"exists": User.objects.filter(email=email).exists()})


def log_out(request):
    previous = request.META.get("HTTP_REFERER")
    if request.user.is_authenticated:
        logout(request)
    if previous:
        return redirect(previous)
    else:
        return redirect("info:home")


def pre_authenticate(request):
    username = request.POST.get("username", "")
    password = request.POST.get("password", "")
    user = User.objects.filter(username=username)
    if user.exists():
        user = authenticate(username=username, password=password)
        if user:
            return JsonResponse({"status": 0})  # Authentication successful
        else:
            return JsonResponse({"status": 1})  # Password incorrect
    else:
        return JsonResponse({"status": 2})  # Username not found


@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, instance=request.user.profile)

        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            return JsonResponse({"successful": True})
        else:
            return JsonResponse({"successful": False, "error": str(u_form.errors) + str(p_form.errors)})

    return render(request, "profile.html", {"user": request.user, "form": SignUpForm()})


@login_required
def password_reset(request):
    reset_form = PasswordChangeForm(request.user, data=request.POST)
    if reset_form.is_valid():
        reset_form.save()
        return JsonResponse({"successful": True})
    else:
        return JsonResponse({"successful": False})
