from django.db import models

class ProjectFile(models.Model):
    file = models.FileField(upload_to='projects/')

class Project(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    technologies = models.JSONField(blank=True, null=True)
    tags = models.JSONField(blank=True, null=True)
    links = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    attached_files = models.ManyToManyField(ProjectFile, blank=True)
    is_starred = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
