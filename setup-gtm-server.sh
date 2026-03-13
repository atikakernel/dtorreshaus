#!/bin/bash
set -e

# ID de configuración de GTM Server Side
CONTAINER_CONFIG='aWQ9R1RNLU0yWDdRUkdUJmVudj0xJmF1dGg9UU5QeUlFTk5yWXJLSnZERHVqaDByUQ=='
DOMAIN='sst.dtorreshaus.com'

echo "🚀 Iniciando configuración de GTM Server Side en EC2..."

# 1. Instalar Docker si no existe
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce
    sudo usermod -aG docker ${USER}
    echo "✅ Docker instalado."
else
    echo "✅ Docker ya está instalado."
fi

# 2. Correr el contenedor de GTM
echo "🚢 Configurando contenedor GTM..."
if [ "$(sudo docker ps -aq -f name=gtm-server)" ]; then
    echo "🔄 Reiniciando contenedor existente..."
    sudo docker stop gtm-server || true
    sudo docker rm gtm-server || true
fi

sudo docker run -d \
  --restart always \
  -p 8080:8080 \
  -e CONTAINER_CONFIG="$CONTAINER_CONFIG" \
  -e RUN_AS_IMAGE_SERVER=true \
  --name gtm-server \
  gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable

echo "✅ Contenedor GTM corriendo en puerto 8080."

# 3. Configurar Nginx como Proxy Inverso
echo "nginx Configurando Nginx para $DOMAIN..."
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activar configuración
sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configurado."

# 4. SSL con Certbot
echo "🔒 Intentando configurar SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# El comando de certbot puede fallar si el DNS no apunta aún
echo "Intentando obtener certificado SSL para $DOMAIN..."
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email webmaster@dtorreshaus.com || echo "⚠️ Advertencia: No se pudo obtener el certificado SSL. Asegúrate de que el DNS sst.dtorreshaus.com esté apuntando a esta IP."

echo "🎉 ¡Configuración de GTM Server Side finalizada!"
