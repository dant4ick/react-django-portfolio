# Generated by Django 5.1.2 on 2024-12-11 23:11

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('short_description', models.TextField()),
                ('description', models.TextField()),
                ('technologies', models.JSONField()),
                ('tags', models.JSONField()),
                ('links', models.JSONField()),
                ('created_at', models.DateTimeField()),
            ],
        ),
    ]
