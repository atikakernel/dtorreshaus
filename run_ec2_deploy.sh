#!/bin/bash
set -e

echo "Deploying to EC2..."

# 1. Copiar llave SSH con permisos correctos a WSL
cp ./dtorresfhaus-key-backup.pem ~/.ssh/key.pem 2>/dev/null || true
chmod 400 ~/.ssh/key.pem

# 2. Conectar a EC2 y desplegar
ssh -i ~/.ssh/key.pem -o StrictHostKeyChecking=no ubuntu@18.191.192.164 << 'EOF'
set -e
echo "✅ Conectado a EC2."

# Instalar PostgreSQL si no existe
echo "🐘 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Configurar PostgreSQL si no existe
echo "⚙️ Configurando PostgreSQL..."
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='dtorres'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER dtorres WITH PASSWORD 'dtorres123';"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='dtorreshaus'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE dtorreshaus;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dtorreshaus TO dtorres;"

# Ir al repositorio
cd /var/www/dtorreshaus/dtorreshaus

# Hacer un reset fuerte para asegurar que la rama coincida exactamente con main
git fetch origin main
git checkout main
git reset --hard origin/main

# Entrar al backend
cd backend

# Asegurar que el .env tiene la cadena de conexión
if ! grep -q "DATABASE_URL" .env; then
  echo "DATABASE_URL=\"postgresql://dtorres:dtorres123@localhost:5432/dtorreshaus?schema=public\"" >> .env
fi

# Instalar dependencias
npm install --production

# Generar Prisma y migrar DB
npx prisma db push --accept-data-loss

# Poblar la base de datos de producción con el catálogo existente
echo "🌱 Poblando base de datos con catálogo..."
node prisma/seed.js

# Reiniciar procesos PM2
echo "🔄 Reiniciando backend con PM2..."
pm2 restart dtorreshaus-backend || pm2 start server.js --name dtorreshaus-backend
pm2 save

echo "✅ Backend desplegado con éxito!"
EOF

echo "Deployment local script finished."
