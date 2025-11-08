#!/bin/bash

# Script para configurar Nginx correctamente

set -e

echo "======================================"
echo "🔧 Configurando Nginx para dtorreshaus"
echo "======================================"
echo ""

# 1. Crear directorio del frontend si no existe
echo "📁 Creando directorios..."
sudo mkdir -p /var/www/dtorreshaus/frontend
sudo chown -R $USER:$USER /var/www/dtorreshaus

# 2. Configurar backend (api.dtorreshaus.com)
echo "⚙️  Configurando api.dtorreshaus.com..."
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

# 3. Configurar frontend (dtorreshaus.com)
echo "⚙️  Configurando dtorreshaus.com..."
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

# 4. Deshabilitar sitio default si existe
echo "🗑️  Removiendo configuración default..."
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Habilitar nuevas configuraciones
echo "🔗 Habilitando sitios..."
sudo ln -sf /etc/nginx/sites-available/api.dtorreshaus.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dtorreshaus.com /etc/nginx/sites-enabled/

# 6. Test de configuración
echo "🧪 Testeando configuración..."
sudo nginx -t

# 7. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "======================================"
echo "✅ Nginx configurado correctamente!"
echo "======================================"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Despliega el frontend desde tu máquina local:"
echo "   ./deploy-frontend.sh"
echo ""
echo "2. O copia manualmente los archivos de dist/ a:"
echo "   /var/www/dtorreshaus/frontend/"
echo ""
echo "3. Verifica:"
echo "   http://api.dtorreshaus.com/health  → Backend"
echo "   http://dtorreshaus.com             → Frontend"
echo ""
