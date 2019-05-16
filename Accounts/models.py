from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models as md
from django.utils.html import mark_safe

from Info.models import Institution, Country


class ParticipantManager(BaseUserManager):

    def create_user(self, identification, name, email, mobile, department, password=None):
        if not identification:
            raise ValueError("Participant must have a identification.")

        user = self.model(
            identification=identification,
            name=name,
            email=email,
            mobile=mobile,
            department=department
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, identification, name, email, mobile, institution, password=None):
        if not identification:
            raise ValueError("User must have a national id.")

        user = self.model(
            identification=identification,
            name=name,
            email=email,
            mobile=mobile,
            institution=institution
        )
        user.set_password(password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class Participant(AbstractBaseUser):
    identification = md.CharField(max_length=255, unique=True)
    name = md.CharField(max_length=255)
    username = md.CharField(max_length=100)
    email = md.EmailField()
    mobile = md.IntegerField()
    institution = md.ForeignKey(Institution, null=True, on_delete=md.SET_NULL)
    date_of_birth = md.DateField()
    gender = md.IntegerField(default=0, choices=((0, "Male"), (1, "Female")))
    country = md.ForeignKey(Country, on_delete=md.CASCADE)
    skills = md.TextField()
    avatar = md.ImageField(upload_to='avatars', blank=True)
    thumbnail = md.ImageField(upload_to='thumbnails', blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["email", "id"]

    objects = ParticipantManager()

    is_active = True
    is_admin = False

    def natural_key(self):
        return self.national_id

    def has_perm(self, perm, obj=None):
        return False

    def set_staff_type(self, val):
        self.staff_type = 1 if val == "lecturer" else 2

    def get_staff_type(self):
        return "lecturer" if self.staff_type == 1 else "timetable"

    def has_module_perms(self, app_label):
        return False

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.national_id

    @property
    def thumb(self):
        return self.thumbnail.url if self.thumbnail else "/static/general/images/placeholder.png"

    @property
    def avt(self):
        # avatar
        return self.avatar.url if self.avatar else "/static/SchoolInfo/images/img.png"

    def __str__(self):
        return self.name

    def avatar_tag(self):
        return mark_safe('<img src="{}" alt="avatar" width="180" height="180"/>'.format(self.avt))

    class Meta:
        db_table = "participant"
