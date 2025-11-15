#!/bin/bash

# ====================================
# DEPLOYMENT SCRIPT - Admin Authentication
# ====================================
# Script para desplegar el sistema de autenticación del panel de admin

set -e  # Salir si hay algún error

echo "======================================"
echo "🚀 DEPLOYING ADMIN AUTHENTICATION"
echo "======================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}📋 Este script hará lo siguiente:${NC}"
echo "1. Copiar archivos del backend (middleware y rutas de admin)"
echo "2. Actualizar server.js y routes/orders.js"
echo "3. Rebuilding frontend con AdminPanel.jsx actualizado"
echo "4. Reiniciar el servidor backend"
echo "5. Actualizar .env con ADMIN_PASSWORD y JWT_SECRET"
echo ""
read -p "¿Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelado"
    exit 1
fi

# ====================================
# 1. BACKEND - Copiar archivos nuevos
# ====================================

echo ""
echo -e "${GREEN}📁 Copiando archivos del backend...${NC}"

# Crear directorio middleware si no existe
ssh dtorreshaus 'mkdir -p /home/ubuntu/dtorreshaus/backend/middleware'

# Copiar middleware de autenticación
scp backend/middleware/auth.js dtorreshaus:/home/ubuntu/dtorreshaus/backend/middleware/

# Copiar rutas de admin
scp backend/routes/admin.js dtorreshaus:/home/ubuntu/dtorreshaus/backend/routes/

# Copiar server.js actualizado
scp backend/server.js dtorreshaus:/home/ubuntu/dtorreshaus/backend/

# Copiar routes/orders.js actualizado (con protección de rutas)
scp backend/routes/orders.js dtorreshaus:/home/ubuntu/dtorreshaus/backend/routes/

echo -e "${GREEN}✅ Archivos backend copiados${NC}"

# ====================================
# 2. FRONTEND - Rebuild
# ====================================

echo ""
echo -e "${GREEN}🔨 Building frontend...${NC}"

# Build del frontend localmente
npm run build

echo -e "${GREEN}✅ Frontend build completado${NC}"

# ====================================
# 3. COPIAR BUILD A SERVIDOR
# ====================================

echo ""
echo -e "${GREEN}📦 Copiando frontend build al servidor...${NC}"

# Copiar build a la ubicación correcta de nginx
ssh dtorreshaus 'mkdir -p /var/www/dtorreshaus/frontend'
scp -r dist/* dtorreshaus:/var/www/dtorreshaus/frontend/

echo -e "${GREEN}✅ Frontend desplegado${NC}"

# ====================================
# 4. REINICIAR BACKEND
# ====================================

echo ""
echo -e "${GREEN}🔄 Reiniciando backend...${NC}"

ssh dtorreshaus 'sudo systemctl restart dtorreshaus-backend'

echo -e "${GREEN}✅ Backend reiniciado${NC}"

# ====================================
# 5. VERIFICAR ESTADO
# ====================================

echo ""
echo -e "${GREEN}🔍 Verificando estado del backend...${NC}"
sleep 2
ssh dtorreshaus 'sudo systemctl status dtorreshaus-backend --no-pager | head -20'

# ====================================
# 6. RECORDATORIOS IMPORTANTES
# ====================================

echo ""
echo "======================================"
echo -e "${YELLOW}⚠️  RECORDATORIOS IMPORTANTES:${NC}"
echo "======================================"
echo ""
echo "1. Debes actualizar el archivo .env en producción con estas variables:"
echo ""
echo "   ADMIN_PASSWORD=tu_password_super_seguro"
echo "   JWT_SECRET=tu_jwt_secret_super_seguro_y_largo"
echo "   ADMIN_EMAIL=admin@dtorreshaus.com"
echo ""
echo "2. Ejecuta estos comandos en el servidor:"
echo ""
echo "   ssh dtorreshaus"
echo "   nano /home/ubuntu/dtorreshaus/backend/.env"
echo ""
echo "   # Agrega al final del archivo:"
echo "   ADMIN_PASSWORD=elige_una_contraseña_segura"
echo "   JWT_SECRET=\$(openssl rand -base64 32)"
echo "   ADMIN_EMAIL=admin@dtorreshaus.com"
echo ""
echo "   # Luego reinicia el backend:"
echo "   sudo systemctl restart dtorreshaus-backend"
echo ""
echo "3. Prueba el login en: https://dtorreshaus.com/admin.html"
echo ""
echo "======================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO${NC}"
echo "======================================"
