from django.urls import path
from .views import ProjectListView, ProjectDetailView, TechnologiesListView, health_check

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:id>/', ProjectDetailView.as_view(), name='project-detail'),
    path('technologies/', TechnologiesListView.as_view(), name='technologies-list'),
]