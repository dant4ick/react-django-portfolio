from rest_framework import serializers
from .models import Project, ProjectFile

class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ["id", "file"]

class ProjectSerializer(serializers.ModelSerializer):
    attached_files = ProjectFileSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
