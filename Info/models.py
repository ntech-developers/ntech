from django.db import models as md
from django.utils.html import mark_safe


class Country(md.Model):
    name = md.CharField(max_length=255)
    flag = md.ImageField(upload_to='flags', blank=True)
    code = md.IntegerField()

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


class Institution(md.Model):
    name = md.CharField(max_length=255)
    country = md.ForeignKey(Country, on_delete=md.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "institution"
