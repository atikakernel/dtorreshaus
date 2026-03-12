#!/bin/bash
set -e

# Detectar si estamos corriendo en la EC2 o localmente
if [ "$USER" == "ubuntu" ]; then
    IS_EC2=true
else
    IS_EC2=false
fi

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$IS_EC2" = false ]; then
    echo -e "${GREEN}🚀 Iniciando despliegue de Frontend desde local...${NC}"
    
    EC2_USER="ubuntu"
    EC2_HOST="18.191.192.164"
    EC2_KEY="${EC2_KEY:-$HOME/.ssh/key.pem}" # Usar variable de entorno o default

    # 1. Build
    echo -e "${YELLOW}📦 Buildeando...${NC}"
    npm run build

    # 2. Preparar remoto
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "rm -rf /tmp/frontend-deploy && mkdir -p /tmp/frontend-deploy"
    
    # 3. Subir build
    scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r dist/* "$EC2_USER@$EC2_HOST:/tmp/frontend-deploy/"

    # 4. Finalizar en el servidor
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "cd /var/www/dtorreshaus/dtorreshaus && bash ./deploy-frontend.sh"
    
    echo -e "${GREEN}✅ Deployment Frontend completado.${NC}"
    exit 0
fi

# --- LOGICA QUE SOLO CORRE EN LA EC2 ---
echo -e "${YELLOW}🔒 Finalizando configuración de Frontend en EC2...${NC}"

# Crear directorio si no existe
sudo mkdir -p /var/www/dtorreshaus/frontend

# Rescatar productos nuevos creados por el administrador desde la EC2 antes del rm -rf
echo "Rescatando imágenes subidas por el admin..."
sudo mkdir -p /tmp/frontend-deploy/assets/products
sudo cp -rn /var/www/dtorreshaus/frontend/assets/products/* /tmp/frontend-deploy/assets/products/ 2>/dev/null || true

# Limpiar archivos viejos
sudo rm -rf /var/www/dtorreshaus/frontend/*

# Copiar nuevos archivos incluyendo el rescate
sudo cp -r /tmp/frontend-deploy/* /var/www/dtorreshaus/frontend/

# Configurar permisos
sudo chown -R www-data:www-data /var/www/dtorreshaus/frontend
sudo chmod -R 755 /var/www/dtorreshaus/frontend

# Limpiar temporal
rm -rf /tmp/frontend-deploy

echo "📁 Servido en /var/www/dtorreshaus/frontend"
echo -e "${GREEN}✅ Proceso interno de EC2 finalizado.${NC}"
