#!/bin/bash

# ====================================
# INSTALACIÓN INICIAL EN EC2
# ====================================
# Este script instala todas las dependencias necesarias en tu EC2
# Ejecutar UNA SOLA VEZ al configurar el servidor por primera vez

set -e  # Salir si hay algún error

echo "======================================"
echo "🚀 dtorreshaus - Instalación en EC2"
echo "======================================"

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Node.js 18.x
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos y usuario
echo "🗄️  Configurando base de datos..."
sudo -u postgres psql << EOF
CREATE DATABASE dtorreshaus_db;
CREATE USER dtorreshaus WITH ENCRYPTED PASSWORD 'CAMBIA_ESTE_PASSWORD_SEGURO';
GRANT ALL PRIVILEGES ON DATABASE dtorreshaus_db TO dtorreshaus;
ALTER DATABASE dtorreshaus_db OWNER TO dtorreshaus;
\q
EOF

# Instalar PM2 (gestor de procesos)
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Instalar Nginx (reverse proxy)
echo "📦 Instalando Nginx..."
sudo apt-get install -y nginx

# Configurar firewall
echo "🔒 Configurando firewall..."
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3001    # Backend (temporal, se quitará después)
sudo ufw --force enable

# Crear directorio para la aplicación
echo "📁 Creando directorio de aplicación..."
sudo mkdir -p /var/www/dtorreshaus
sudo chown -R $USER:$USER /var/www/dtorreshaus

# Instalar Certbot (para SSL gratis)
echo "📦 Instalando Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

echo "======================================"
echo "✅ Instalación completada"
echo "======================================"
echo ""
echo "Siguiente paso:"
echo "1. Configurar tu dominio apuntando a esta IP"
echo "2. Ejecutar deploy.sh para subir el código"
echo ""
echo "Tu IP pública:"
curl -s http://checkip.amazonaws.com
echo ""
