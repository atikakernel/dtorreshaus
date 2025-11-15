#!/bin/bash

# Script para desplegar la corrección del widget de Wompi

echo "🚀 Desplegando corrección del widget de Wompi..."
echo ""

# Conectar al servidor y actualizar
ssh ubuntu@ec2-54-158-172-131.compute-1.amazonaws.com << 'ENDSSH'
  cd /var/www/dtorreshaus/dtorreshaus

  echo "📥 Haciendo pull de los cambios..."
  git fetch origin
  git checkout claude/fix-wompi-widget-01JBYhcNspEiAXRaqVWbVLzY
  git pull origin claude/fix-wompi-widget-01JBYhcNspEiAXRaqVWbVLzY

  echo "🔧 Instalando dependencias del backend si hay cambios..."
  cd backend
  npm install

  echo "🔄 Reiniciando backend..."
  pm2 restart dtorreshaus-backend

  echo "✅ Backend actualizado!"

  echo "🎨 Rebuilding frontend..."
  cd ../
  npm install
  npm run build

  echo "✅ Frontend rebuildeado!"

  echo "📊 Estado de PM2:"
  pm2 status

  echo ""
  echo "✅ Despliegue completado!"
ENDSSH

echo ""
echo "🎉 Listo! Ahora el widget de Wompi debería funcionar correctamente."
echo "Prueba haciendo un pedido en https://dtorreshaus.com"
