from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class ProjectListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('project_list')
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        Project.objects.create(
            name='Project 1', 
            description='Description 1', 
            technologies=['Django', 'React'], 
            tags=['web', 'backend'], 
            links=['https://github.com/project1'], 
            created_at='2023-01-01T00:00:00Z',
            attached_files=['image1.jpg', 'document1.pdf']
        )
        Project.objects.create(
            name='Project 2', 
            description='Description 2', 
            technologies=['Flask', 'Vue'], 
            tags=['web', 'frontend'], 
            links=['https://github.com/project2'], 
            created_at='2023-01-02T00:00:00Z',
            attached_files=['image2.jpg', 'document2.pdf']
        )

    def authenticate(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_projects(self):
        response = self.client.get(self.url)
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_create_project_unauthenticated(self):
        data = {
            'name': 'Project 3', 
            'description': 'Description 3', 
            'technologies': ['Node', 'Angular'], 
            'tags': ['web', 'fullstack'], 
            'links': ['https://github.com/project3'], 
            'created_at': '2023-01-03T00:00:00Z',
            'attached_files': ['image3.jpg', 'document3.pdf']
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_project_authenticated(self):
        self.authenticate()
        data = {
            'name': 'Project 3', 
            'description': 'Description 3', 
            'technologies': ['Node', 'Angular'], 
            'tags': ['web', 'fullstack'], 
            'links': ['https://github.com/project3'], 
            'created_at': '2023-01-03T00:00:00Z',
            'attached_files': ['image3.jpg', 'document3.pdf']
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 3)
        self.client.credentials()

class ProjectDetailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project = Project.objects.create(
            name='Project 1', 
            description='Description 1', 
            technologies=['Django', 'React'], 
            tags=['web', 'backend'], 
            links=['https://github.com/project1'], 
            created_at='2023-01-01T00:00:00Z',
            attached_files=['image1.jpg', 'document1.pdf']
        )
        self.url = reverse('project_detail', args=[self.project.id])
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def authenticate(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_get_project(self):
        response = self.client.get(self.url)
        serializer = ProjectSerializer(self.project)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_update_project_unauthenticated(self):
        data = {
            'name': 'Updated Project', 
            'description': 'Updated Description', 
            'technologies': ['Python', 'Django'], 
            'tags': ['web', 'backend'], 
            'links': ['https://github.com/updatedproject'], 
            'created_at': '2023-01-04T00:00:00Z',
            'attached_files': ['image1.jpg', 'document1.pdf']
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_project_authenticated(self):
        self.authenticate()
        data = {
            'name': 'Updated Project', 
            'description': 'Updated Description', 
            'technologies': ['Python', 'Django'], 
            'tags': ['web', 'backend'], 
            'links': ['https://github.com/updatedproject'], 
            'created_at': '2023-01-04T00:00:00Z',
            'attached_files': ['image1.jpg', 'document1.pdf']
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.name, 'Updated Project')
        self.client.credentials()

    def test_delete_project_unauthenticated(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_project_authenticated(self):
        self.authenticate()
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)
        self.client.credentials()

