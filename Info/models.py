from django.db import models as md
from django.utils.html import mark_safe


class Institution(md.Model):
    name = md.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "institution"


class Country(md.Model):
    name = md.CharField(max_length=255)
    flag = md.ImageField(upload_to='flags', blank=True)

    def __str__(self):
        return self.name

    @property
    def flag_img(self):
        # avatar
        return self.flag.url if self.flag else "/static/SchoolInfo/images/img.png"

    def flag_tag(self):
        return mark_safe('<img src="{}" alt="flag of {}" width="40" height="30"/>'.format(self.flag_img, self.name))

    class Meta:
        db_table = "country"
