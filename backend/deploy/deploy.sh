#!/bin/bash

# ====================================
# SCRIPT DE DEPLOYMENT
# ====================================
# Ejecutar desde tu computadora local para deployar a EC2
# Uso: ./deploy.sh

set -e

# CONFIGURACIÓN - EDITA ESTOS VALORES
EC2_USER="ubuntu"                           # Usuario EC2 (ubuntu para Ubuntu, ec2-user para Amazon Linux)
EC2_HOST="tu-ip-publica-ec2.com"           # IP pública de tu EC2
EC2_KEY="~/.ssh/tu-llave-ec2.pem"          # Ruta a tu llave SSH
REMOTE_DIR="/var/www/dtorreshaus/backend"  # Directorio en EC2

echo "======================================"
echo "🚀 Deploying dtorreshaus backend to EC2"
echo "======================================"

# Verificar que existe la llave SSH
if [ ! -f "$EC2_KEY" ]; then
    echo "❌ Error: No se encontró la llave SSH en $EC2_KEY"
    exit 1
fi

# Crear directorio remoto si no existe
echo "📁 Preparando directorio remoto..."
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR"

# Sincronizar archivos (excluir node_modules)
echo "📤 Subiendo archivos..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.git' \
    -e "ssh -i $EC2_KEY" \
    ../ "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

# Ejecutar comandos en el servidor
echo "🔧 Configurando en servidor..."
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'

cd /var/www/dtorreshaus/backend

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Configurar .env si no existe
if [ ! -f .env ]; then
    echo "⚠️  Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita /var/www/dtorreshaus/backend/.env con tus credenciales reales"
fi

# Generar Prisma Client
echo "🗄️  Generando Prisma Client..."
npx prisma generate

# Ejecutar migraciones (primera vez)
# echo "🗄️  Ejecutando migraciones..."
# npx prisma migrate deploy

# Reiniciar aplicación con PM2
echo "🔄 Reiniciando aplicación..."
pm2 stop dtorreshaus-backend || true
pm2 delete dtorreshaus-backend || true
pm2 start server.js --name dtorreshaus-backend --time
pm2 save
pm2 startup | grep sudo | bash

echo "✅ Deployment completado"

# Mostrar logs
pm2 logs dtorreshaus-backend --lines 20

ENDSSH

echo "======================================"
echo "✅ Deployment exitoso"
echo "======================================"
echo ""
echo "Tu backend está corriendo en:"
echo "http://$EC2_HOST:3001"
echo ""
echo "Verifica con:"
echo "curl http://$EC2_HOST:3001/health"
echo ""
