from django.contrib import admin
from django import forms
from .models import Project, ProjectFile, RelationSettings

class RelationSettingsForm(forms.ModelForm):
    """Custom form for RelationSettings with better field handling"""
    
    available_tags = forms.MultipleChoiceField(
        choices=[],
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Exclude these tags from similarity calculations"
    )
    
    available_technologies = forms.MultipleChoiceField(
        choices=[],
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Exclude these technologies from similarity calculations"
    )
    
    class Meta:
        model = RelationSettings
        fields = ['available_tags', 'available_technologies']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Get all unique tags and technologies from projects
        all_tags = set()
        all_technologies = set()
        
        for project in Project.objects.all():
            if project.tags:
                all_tags.update(project.tags)
            if project.technologies:
                all_technologies.update(project.technologies)
        
        # Set choices for the fields
        self.fields['available_tags'].choices = [(tag, tag) for tag in sorted(all_tags)]
        self.fields['available_technologies'].choices = [(tech, tech) for tech in sorted(all_technologies)]
        
        # Set initial values if instance exists
        if self.instance and self.instance.pk:
            if self.instance.excluded_tags:
                self.fields['available_tags'].initial = self.instance.excluded_tags
            if self.instance.excluded_technologies:
                self.fields['available_technologies'].initial = self.instance.excluded_technologies
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.excluded_tags = self.cleaned_data.get('available_tags', [])
        instance.excluded_technologies = self.cleaned_data.get('available_technologies', [])
        if commit:
            instance.save()
        return instance

@admin.register(RelationSettings)
class RelationSettingsAdmin(admin.ModelAdmin):
    form = RelationSettingsForm
    list_display = ['__str__', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not RelationSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_starred', 'created_at']
    list_filter = ['is_starred', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['attached_files']

@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'file']
