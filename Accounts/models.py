from datetime import date

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from Info.models import Institution, Country


def safe_int(val):
    try:
        return int(val)
    except ValueError:
        return 0


class Profile(models.Model):
    GENDER = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=50, null=True)
    gender = models.CharField(max_length=20, choices=GENDER, null=True)
    date_of_birth = models.DateField(null=True)
    assessor = models.BooleanField(default=False)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True)
    institution = models.ForeignKey(Institution, null=True, on_delete=models.SET_NULL)
    skills = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.user.username

    def skills_list(self):
        if self.skills:
            return self.skills.split(",")
        return []

    def age(self):
        if self.date_of_birth:
            delta = date.today() - self.date_of_birth
            return int(delta.days / 365)
        return '-'

    def mobile_code(self):
        return safe_int(str(self.mobile)[:3])

    def raw_mobile_number(self):
        return safe_int(str(self.mobile)[3:])

    def compress_mobile(self, code, number):
        return safe_int(str(code) + str(number))

    class Meta:
        db_table = "profile"


class Project(models.Model):
    name = models.CharField(max_length=255)
    github_link = models.URLField(blank=True)
    youtube_link = models.URLField(blank=True)
    points_awarded = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ('name',)
        db_table = 'project'

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name


# Hooking the following methods to the Django defined User model
@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
