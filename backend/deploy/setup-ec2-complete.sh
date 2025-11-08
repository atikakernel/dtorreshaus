#!/bin/bash

# ====================================
# SETUP COMPLETO EC2 - dtorreshaus
# ====================================
# Configura Nginx, SSL, dominios, etc.
# ====================================

set -e

echo "===================================="
echo "🚀 Setup EC2 - dtorreshaus"
echo "===================================="

# 1. Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
else
    echo "✅ Nginx ya está instalado"
fi

# 2. Crear directorios
echo "📁 Creando directorios..."
sudo mkdir -p /var/www/dtorreshaus/frontend
sudo mkdir -p /var/www/dtorreshaus/backend
sudo chown -R $USER:$USER /var/www/dtorreshaus

# 3. Copiar configuraciones de Nginx
echo "⚙️  Configurando Nginx..."

# Backend (api.dtorreshaus.com)
sudo tee /etc/nginx/sites-available/api.dtorreshaus.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.dtorreshaus.com;

    access_log /var/log/nginx/api.dtorreshaus.access.log;
    error_log /var/log/nginx/api.dtorreshaus.error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Frontend (dtorreshaus.com)
sudo tee /etc/nginx/sites-available/dtorreshaus.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name dtorreshaus.com www.dtorreshaus.com;

    root /var/www/dtorreshaus/frontend;
    index index.html;

    access_log /var/log/nginx/dtorreshaus.access.log;
    error_log /var/log/nginx/dtorreshaus.error.log;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF

# 4. Habilitar sitios
echo "🔗 Habilitando sitios..."
sudo ln -sf /etc/nginx/sites-available/api.dtorreshaus.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dtorreshaus.com /etc/nginx/sites-enabled/

# 5. Remover sitio default si existe
sudo rm -f /etc/nginx/sites-enabled/default

# 6. Testear configuración de Nginx
echo "🧪 Testeando configuración de Nginx..."
sudo nginx -t

# 7. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "===================================="
echo "✅ Setup de Nginx completado!"
echo "===================================="
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  Configura tus registros DNS:"
echo "   A    dtorreshaus.com          → $(curl -s ifconfig.me)"
echo "   A    www.dtorreshaus.com      → $(curl -s ifconfig.me)"
echo "   A    api.dtorreshaus.com      → $(curl -s ifconfig.me)"
echo ""
echo "2️⃣  Espera 5-10 minutos a que se propaguen los DNS"
echo ""
echo "3️⃣  Instala SSL con Certbot:"
echo "   sudo apt-get install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d dtorreshaus.com -d www.dtorreshaus.com"
echo "   sudo certbot --nginx -d api.dtorreshaus.com"
echo ""
echo "4️⃣  Despliega el backend:"
echo "   cd /var/www/dtorreshaus/backend"
echo "   git clone <tu-repo> ."
echo "   npm install"
echo "   pm2 start server.js --name dtorreshaus-backend"
echo ""
echo "5️⃣  Despliega el frontend:"
echo "   (Desde tu máquina local, ejecuta ./deploy-frontend.sh)"
echo ""
