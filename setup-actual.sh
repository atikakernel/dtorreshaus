#!/bin/bash

# Script de setup para la estructura ACTUAL del proyecto
# Usa: /var/www/dtorreshaus/dtorreshaus/

set -e

echo "======================================"
echo "🚀 Setup con estructura actual"
echo "======================================"
echo ""

PROJECT_ROOT="/var/www/dtorreshaus/dtorreshaus"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_BUILD="$PROJECT_ROOT/dist"
NGINX_FRONTEND_ROOT="/var/www/dtorreshaus/frontend"

# 1. Verificar que existe el proyecto
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Error: No existe $PROJECT_ROOT"
    exit 1
fi

echo "✅ Proyecto encontrado en $PROJECT_ROOT"

# 2. Crear directorio para frontend
echo "📁 Creando directorio para frontend..."
sudo mkdir -p $NGINX_FRONTEND_ROOT
sudo chown -R $USER:$USER $NGINX_FRONTEND_ROOT

# 3. Copiar build del frontend si existe
if [ -d "$FRONTEND_BUILD" ]; then
    echo "📦 Copiando archivos del frontend..."
    sudo cp -r $FRONTEND_BUILD/* $NGINX_FRONTEND_ROOT/
    sudo chown -R www-data:www-data $NGINX_FRONTEND_ROOT
    sudo chmod -R 755 $NGINX_FRONTEND_ROOT
    echo "✅ Frontend copiado"
else
    echo "⚠️  No existe $FRONTEND_BUILD - necesitas buildear el frontend primero"
fi

# 4. Configurar Nginx para backend (api.dtorreshaus.com)
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

# 5. Configurar Nginx para frontend (dtorreshaus.com)
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

# 6. Remover configs que interfieren
echo "🗑️  Removiendo configuraciones antiguas..."
sudo rm -f /etc/nginx/sites-enabled/default

# 7. Habilitar nuevas configuraciones
echo "🔗 Habilitando sitios..."
sudo ln -sf /etc/nginx/sites-available/api.dtorreshaus.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dtorreshaus.com /etc/nginx/sites-enabled/

# 8. Test de configuración
echo "🧪 Testeando configuración de Nginx..."
sudo nginx -t

# 9. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo ""
echo "======================================"
echo "✅ Setup completado!"
echo "======================================"
echo ""
echo "📋 Estado:"
echo ""
echo "Backend:"
echo "  📂 Código: $BACKEND_DIR"
echo "  🔌 PM2: pm2 status"
echo "  🌐 URL: http://api.dtorreshaus.com/health"
echo ""
echo "Frontend:"
echo "  📂 Build: $NGINX_FRONTEND_ROOT"
echo "  🌐 URL: http://dtorreshaus.com"
echo ""
echo "⚠️  IMPORTANTE: Si el frontend no se ve,"
echo "    necesitas buildearlo y copiarlo:"
echo ""
echo "    # Desde tu máquina local:"
echo "    npm run build"
echo "    scp -r dist/* ubuntu@EC2_IP:/tmp/frontend/"
echo ""
echo "    # En EC2:"
echo "    sudo cp -r /tmp/frontend/* /var/www/dtorreshaus/frontend/"
echo "    sudo chown -R www-data:www-data /var/www/dtorreshaus/frontend"
echo ""
