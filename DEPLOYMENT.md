# Deployment Guide for React-Django Portfolio

This guide explains how to deploy your React-Django portfolio to your dant4ick.ru server using GitHub Actions.

## Server Setup

### 1. Initial Server Configuration

Run the setup script on your server:

```bash
chmod +x server-setup.sh
./server-setup.sh
```

### 2. SSL Certificate Setup

Install and configure Let's Encrypt SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dant4ick.ru -d www.dant4ick.ru
```

### 3. GitHub Repository Setup

Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

- `HOST`: Your server IP address or domain (dant4ick.ru)
- `USERNAME`: SSH username for your server
- `PRIVATE_KEY`: SSH private key for authentication
- `PORT`: SSH port (usually 22)
- `DJANGO_SECRET_KEY`: A secure secret key for Django

### 4. Manual File Setup on Server

Copy the following files to your server:

```bash
# Copy nginx configuration
sudo cp nginx-portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Copy systemd service file
sudo cp portfolio-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable portfolio-backend
```

## Directory Structure on Server

```
/var/www/react-django-portfolio/
├── portfolio_backend/
│   ├── venv/                 # Python virtual environment
│   ├── static/              # Django static files
│   ├── media/               # User uploaded files
│   └── .env                 # Environment variables
└── portfolio_frontend/
    └── dist/                # Built React application
```

## Environment Variables

Create `/var/www/react-django-portfolio/portfolio_backend/.env`:

```env
DJANGO_SECRET_KEY=your-very-secure-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=dant4ick.ru,www.dant4ick.ru
```

## Services Management

### Start/Stop Services

```bash
# Django backend
sudo systemctl start portfolio-backend
sudo systemctl stop portfolio-backend
sudo systemctl restart portfolio-backend
sudo systemctl status portfolio-backend

# Nginx
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### View Logs

```bash
# Django backend logs
sudo journalctl -u portfolio-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Deployment Process

1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Build the React frontend
   - Test the Django backend
   - Deploy to your server
   - Restart services

## Manual Deployment

If you need to deploy manually:

```bash
cd /var/www/react-django-portfolio

# Pull latest changes
git pull origin main

# Update frontend
cd portfolio_frontend
npm ci
npm run build

# Update backend
cd ../portfolio_backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart portfolio-backend
sudo systemctl reload nginx
```

## Troubleshooting

### Common Issues

1. **Permission errors**: Ensure www-data owns the project directory
   ```bash
   sudo chown -R www-data:www-data /var/www/react-django-portfolio
   ```

2. **Static files not loading**: Run collectstatic and check nginx configuration
   ```bash
   cd /var/www/react-django-portfolio/portfolio_backend
   source venv/bin/activate
   python manage.py collectstatic --noinput
   ```

3. **Database errors**: Run migrations
   ```bash
   python manage.py migrate
   ```

4. **502 Bad Gateway**: Check if Django backend is running
   ```bash
   sudo systemctl status portfolio-backend
   ```

### Performance Optimization

1. **Enable Gzip compression**: Already configured in nginx
2. **Static file caching**: Already configured with proper cache headers
3. **Database optimization**: Consider switching to PostgreSQL for production

## Security Considerations

1. Keep Django secret key secure
2. Regular security updates
3. Monitor server logs
4. Use strong SSH key authentication
5. Consider implementing rate limiting

## Monitoring

Set up monitoring for:
- Service health (portfolio-backend, nginx)
- Disk space usage
- SSL certificate expiration
- Server performance metrics
