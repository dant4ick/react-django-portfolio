#!/bin/bash

# Server setup script for React-Django Portfolio
# Run this script on your server to set up the deployment environment

set -e

echo "Setting up React-Django Portfolio deployment environment..."

# Variables
PROJECT_DIR="/var/www/react-django-portfolio"
SERVICE_NAME="portfolio-backend"
NGINX_AVAILABLE="/etc/nginx/sites-available/portfolio"
NGINX_ENABLED="/etc/nginx/sites-enabled/portfolio"

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx git

# Create project directory
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone repository (you'll need to set up SSH keys or use HTTPS)
cd /var/www
git clone https://github.com/your-username/react-django-portfolio.git
cd $PROJECT_DIR

# Set up Python virtual environment
cd portfolio_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
cd ../portfolio_frontend
npm install
npm run build

# Set up systemd service
sudo cp ../portfolio-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

# Set up nginx configuration
sudo cp ../nginx-portfolio.conf $NGINX_AVAILABLE
sudo ln -sf $NGINX_AVAILABLE $NGINX_ENABLED
sudo nginx -t

# Set proper permissions
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Create environment file for Django
cd $PROJECT_DIR/portfolio_backend
cat > .env << EOF
DJANGO_SECRET_KEY=your-very-secure-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=dant4ick.ru,www.dant4ick.ru
EOF

# Run Django migrations and collect static files
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput

# Start services
sudo systemctl start $SERVICE_NAME
sudo systemctl reload nginx

echo "Setup complete!"
echo "Don't forget to:"
echo "1. Set up SSL certificates with Let's Encrypt"
echo "2. Configure GitHub secrets for deployment"
echo "3. Update the Django secret key in .env file"
echo "4. Set up proper database if not using SQLite"
