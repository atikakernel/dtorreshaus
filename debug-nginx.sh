#!/bin/bash

# Script de diagnóstico de Nginx

echo "======================================"
echo "🔍 Diagnóstico de Nginx"
echo "======================================"
echo ""

echo "1️⃣  Configuraciones de Nginx habilitadas:"
echo "--------------------------------------"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "2️⃣  Configuraciones disponibles:"
echo "--------------------------------------"
ls -la /etc/nginx/sites-available/
echo ""

echo "3️⃣  Contenido de dtorreshaus.com config:"
echo "--------------------------------------"
if [ -f /etc/nginx/sites-available/dtorreshaus.com ]; then
    cat /etc/nginx/sites-available/dtorreshaus.com
else
    echo "❌ NO EXISTE"
fi
echo ""

echo "4️⃣  Contenido de api.dtorreshaus.com config:"
echo "--------------------------------------"
if [ -f /etc/nginx/sites-available/api.dtorreshaus.com ]; then
    cat /etc/nginx/sites-available/api.dtorreshaus.com
else
    echo "❌ NO EXISTE"
fi
echo ""

echo "5️⃣  Archivos del frontend:"
echo "--------------------------------------"
if [ -d /var/www/dtorreshaus/frontend ]; then
    ls -la /var/www/dtorreshaus/frontend/
else
    echo "❌ DIRECTORIO NO EXISTE"
fi
echo ""

echo "6️⃣  Test de configuración de Nginx:"
echo "--------------------------------------"
sudo nginx -t
echo ""

echo "7️⃣  Estado de Nginx:"
echo "--------------------------------------"
sudo systemctl status nginx --no-pager
echo ""
