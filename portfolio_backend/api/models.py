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

class RelationSettings(models.Model):
    """Settings for controlling which tags and technologies are excluded from project relation calculations"""
    excluded_tags = models.JSONField(
        blank=True, 
        null=True, 
        default=list,
        help_text="List of tags to exclude from similarity calculations"
    )
    excluded_technologies = models.JSONField(
        blank=True, 
        null=True, 
        default=list,
        help_text="List of technologies to exclude from similarity calculations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Relation Settings"
        verbose_name_plural = "Relation Settings"
    
    def __str__(self):
        return f"Relation Settings (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    @classmethod
    def get_current_settings(cls):
        """Get the current relation settings, creating default if none exist"""
        settings, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'excluded_tags': [],
                'excluded_technologies': []
            }
        )
        return settings
