#!/bin/bash

# Script para reorganizar la estructura del proyecto en EC2

set -e

echo "======================================"
echo "🔧 Reorganizando estructura de archivos"
echo "======================================"
echo ""

# 1. Verificar la estructura actual
echo "📁 Estructura actual:"
ls -la /var/www/dtorreshaus/

echo ""
echo "🔄 Reorganizando..."

# 2. Mover backend al lugar correcto
if [ -d "/var/www/dtorreshaus/dtorreshaus/backend" ]; then
    echo "📦 Moviendo backend..."
    sudo rm -rf /var/www/dtorreshaus/backend 2>/dev/null || true
    sudo cp -r /var/www/dtorreshaus/dtorreshaus/backend /var/www/dtorreshaus/backend
    sudo chown -R $USER:$USER /var/www/dtorreshaus/backend
    echo "✅ Backend movido a /var/www/dtorreshaus/backend"
fi

# 3. Crear directorio para frontend
echo "📦 Creando directorio para frontend..."
sudo mkdir -p /var/www/dtorreshaus/frontend
sudo chown -R $USER:$USER /var/www/dtorreshaus/frontend
echo "✅ Directorio frontend creado en /var/www/dtorreshaus/frontend"

# 4. Copiar archivos del build si existen
if [ -d "/var/www/dtorreshaus/dtorreshaus/dist" ]; then
    echo "📦 Copiando archivos del build..."
    cp -r /var/www/dtorreshaus/dtorreshaus/dist/* /var/www/dtorreshaus/frontend/ 2>/dev/null || true
    echo "✅ Archivos del build copiados"
fi

# 5. Ajustar permisos
echo "🔒 Ajustando permisos..."
sudo chown -R www-data:www-data /var/www/dtorreshaus/frontend
sudo chmod -R 755 /var/www/dtorreshaus/frontend

echo ""
echo "======================================"
echo "✅ Reorganización completada!"
echo "======================================"
echo ""
echo "📁 Estructura nueva:"
ls -la /var/www/dtorreshaus/

echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  El backend ahora está en:"
echo "   /var/www/dtorreshaus/backend"
echo ""
echo "2️⃣  Para actualizar el backend en el futuro:"
echo "   cd /var/www/dtorreshaus/dtorreshaus"
echo "   git pull"
echo "   cp -r backend/* /var/www/dtorreshaus/backend/"
echo "   cd /var/www/dtorreshaus/backend"
echo "   npm install"
echo "   pm2 restart dtorreshaus-backend"
echo ""
echo "3️⃣  O mejor aún, clona el repo directamente en backend:"
echo "   cd /var/www/dtorreshaus"
echo "   rm -rf backend"
echo "   git clone <tu-repo> backend"
echo ""
