from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Project
import json

class SecurityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')

    def authenticate(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'pass1234'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_project_requires_authentication(self):
        url = reverse('project-list')
        response = self.client.post(url, {'projectData': json.dumps({'name': 'Test'})}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_project_modification_requires_authentication(self):
        self.authenticate()
        create_response = self.client.post(
            reverse('project-list'),
            {'projectData': json.dumps({'name': 'Secure'})},
            format='multipart'
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        project_id = create_response.data['id']
        self.client.credentials()  # remove auth

        update_url = reverse('project-detail', args=[project_id])
        update_response = self.client.put(update_url, {'projectData': json.dumps({'name': 'Changed'})}, format='multipart')
        self.assertEqual(update_response.status_code, status.HTTP_401_UNAUTHORIZED)

        delete_response = self.client.delete(update_url)
        self.assertEqual(delete_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_relation_settings_requires_authentication(self):
        url = reverse('relation-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_health_check_public(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'healthy')


class APIFunctionalTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')

    def authenticate(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_update_delete_project_authenticated(self):
        self.authenticate()

        # Create
        create_resp = self.client.post(
            reverse('project-list'),
            {'projectData': json.dumps({'name': 'ProjectX'})},
            format='multipart'
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        project_id = create_resp.data['id']

        # Update
        update_resp = self.client.put(
            reverse('project-detail', args=[project_id]),
            {'projectData': json.dumps({'name': 'UpdatedX'})},
            format='multipart'
        )
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data['name'], 'UpdatedX')

        # Delete
        delete_resp = self.client.delete(reverse('project-detail', args=[project_id]))
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_project_listing_filter_and_technologies(self):
        Project.objects.create(name='One', technologies=['Django'])
        Project.objects.create(name='Two', technologies=['Flask'], is_starred=True)

        resp = self.client.get(reverse('project-list') + '?is_starred=true')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

        tech_resp = self.client.get(reverse('technologies-list'))
        self.assertEqual(tech_resp.status_code, status.HTTP_200_OK)
        self.assertIn('Django', tech_resp.data)
        self.assertIn('Flask', tech_resp.data)

    def test_relation_settings_workflow(self):
        self.authenticate()

        get_resp = self.client.get(reverse('relation-settings'))
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data['excluded_tags'], [])

        update_payload = {
            'excluded_tags': ['no'],
            'excluded_technologies': ['secret']
        }
        update_resp = self.client.put(reverse('relation-settings'), update_payload, format='json')
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(update_resp.data['excluded_tags'], ['no'])

        confirm_resp = self.client.get(reverse('relation-settings'))
        self.assertEqual(confirm_resp.data['excluded_technologies'], ['secret'])

    def test_invalid_token_denied(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid')
        resp = self.client.get(reverse('relation-settings'))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
