#!/bin/bash

# ====================================
# SCRIPT DE DEPLOYMENT - FRONTEND
# ====================================
# Despliega el frontend de React a EC2
# ====================================

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}🚀 Deployment Frontend - dtorreshaus${NC}"
echo -e "${GREEN}=====================================${NC}"

# Variables (configuradas para dtorreshaus)
EC2_USER="ubuntu"
EC2_HOST="18.191.192.164"
EC2_KEY="./dtorresfhaus-key-backup.pem"
REMOTE_DIR="/var/www/dtorreshaus/frontend"

# 1. Build del frontend
echo -e "${YELLOW}📦 Buildeando frontend...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: No se generó el directorio dist${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado${NC}"

# 2. Crear directorio temporal en EC2
echo -e "${YELLOW}📁 Preparando directorio en EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "rm -rf /tmp/frontend-deploy && mkdir -p /tmp/frontend-deploy"

# 3. Subir archivos usando SCP
echo -e "${YELLOW}📤 Subiendo archivos a EC2...${NC}"
scp -r -i "$EC2_KEY" dist/* "$EC2_USER@$EC2_HOST:/tmp/frontend-deploy/"

echo -e "${GREEN}✅ Archivos subidos${NC}"

# 4. Mover archivos y configurar permisos
echo -e "${YELLOW}🔒 Configurando en producción...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
# Crear directorio si no existe
sudo mkdir -p /var/www/dtorreshaus/frontend

# Limpiar archivos viejos
sudo rm -rf /var/www/dtorreshaus/frontend/*

# Copiar nuevos archivos
sudo cp -r /tmp/frontend-deploy/* /var/www/dtorreshaus/frontend/

# Configurar permisos
sudo chown -R www-data:www-data /var/www/dtorreshaus/frontend
sudo chmod -R 755 /var/www/dtorreshaus/frontend

# Limpiar temporal
rm -rf /tmp/frontend-deploy

# Verificar archivos
echo "📁 Archivos en frontend:"
ls -la /var/www/dtorreshaus/frontend/
ENDSSH

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ Deployment completado!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}🌐 Tu sitio debería estar en: http://dtorreshaus.com${NC}"
echo -e "${YELLOW}📊 Verifica en: http://$EC2_HOST${NC}"
