import json
from urllib.parse import unquote
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Project, ProjectFile
from .serializers import ProjectSerializer
from django.db.models.signals import post_delete
from django.dispatch import receiver


class ProjectListView(APIView):
    def get(self, request):
        is_starred = request.query_params.get('is_starred')
        if is_starred is not None:
            projects = Project.objects.filter(is_starred=is_starred.lower() == 'true')
        else:
            projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        for project in serializer.data:
            project_instance = Project.objects.get(id=project['id'])
            project['attached_files'] = [{"id": file.id, "file": file.file.url} for file in project_instance.attached_files.all()]
        return Response(serializer.data)
    
    def post(self, request):
        permission_classes = [IsAuthenticated]
        self.check_permissions(permission_classes)
        
        data = json.loads(request.data.dict()['projectData'])        
        attached_files_data = request.FILES.getlist("attached_files")
        
        # Create the Project
        serializer = ProjectSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()

        # Handle attached files
        for file in attached_files_data:
            project_file = ProjectFile.objects.create(file=file)
            project.attached_files.add(project_file)

        return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    def get_related_projects(self, project):
        related_projects = Project.objects.exclude(id=project.id)
        
        # Calculate the match score for each project
        def match_score(p):
            score = 0
            if project.tags and p.tags:
                score += len(set(project.tags) & set(p.tags))
            if project.technologies and p.technologies:
                score += len(set(project.technologies) & set(p.technologies))
            return score
        
        # Annotate projects with their match score and filter out those with no matches
        related_projects = [p for p in related_projects if match_score(p) > 0]
        
        # Sort projects by their match score in descending order
        related_projects = sorted(related_projects, key=match_score, reverse=True)
        
        return related_projects

    def get(self, request, id):
        try:
            project = Project.objects.get(id=id)
        except Project.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project)
        project_data = serializer.data
        project_data['attached_files'] = [{"id": file.id, "file": file.file.url} for file in project.attached_files.all()]

        # Fetch related projects
        related_projects = self.get_related_projects(project)
        related_projects_serializer = ProjectSerializer(related_projects, many=True)
        project_data['related_projects'] = related_projects_serializer.data

        return Response(project_data)

    def put(self, request, id):
        permission_classes = [IsAuthenticated]
        self.check_permissions(permission_classes)
        
        try:
            project = Project.objects.get(id=id)
        except Project.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
                
        data = json.loads(request.data.dict()['projectData'])        
        
        retained_files = json.loads(request.data.dict().get('retained_files', '[]'))
        retained_files: list = retained_files if isinstance(retained_files, list) else [retained_files]
        for i in range(len(retained_files)):
            retained_files[i] = unquote(retained_files[i].split('/media/')[-1])
        
        serializer = ProjectSerializer(project, data=data)
        if serializer.is_valid():
            project = serializer.save()

            # Handle attached files
            existing_files = {file.file.name: file for file in project.attached_files.all()}
            new_files = {file.name: file for file in request.FILES.getlist("attached_files")}

            # Add new files
            for file_name, file in new_files.items():
                if file_name not in existing_files:
                    project_file = ProjectFile.objects.create(file=file)
                    project.attached_files.add(project_file)

            # Remove old files that are not in the retained files list
            removed_files = set(existing_files.keys()) - set(retained_files)
            for file_name in removed_files:
                project.attached_files.remove(existing_files[file_name])
                existing_files[file_name].file.delete()  # Deletes the file from storage
                existing_files[file_name].delete()  # Deletes the ProjectFile instance
            
            return Response(ProjectSerializer(project).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        permission_classes = [IsAuthenticated]
        self.check_permissions(permission_classes)
        
        try:
            project = Project.objects.get(id=id)
        except Project.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TechnologiesListView(APIView):
    def get(self, request):
        projects = Project.objects.all()
        technologies = set()
        for project in projects:
            if project.technologies:
                technologies.update(project.technologies)
        return Response(list(technologies))


@receiver(post_delete, sender=Project)
def delete_attached_files(sender, instance, **kwargs):
    """
    Delete attached files when a Project instance is deleted.
    """
    if instance.attached_files:
        for file in instance.attached_files.all():
            file.file.delete()  # Deletes the file from storage
        instance.attached_files.clear()
