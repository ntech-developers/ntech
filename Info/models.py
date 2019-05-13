from django.db import models as md


class Institution(md.Model):
    name = md.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "institution"
