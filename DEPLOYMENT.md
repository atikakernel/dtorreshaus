# 🚀 Guía de Deployment - EC2

Esta guía te ayudará a actualizar y redeployar tanto el frontend como el backend de dtorreshaus en tu instancia EC2.

---

## 📋 Pre-requisitos

1. Acceso SSH a tu instancia EC2
2. Git configurado en la instancia
3. Node.js y npm instalados
4. PM2 instalado (para el backend)
5. Nginx configurado (para el frontend)

---

## 🔄 Actualizar Código desde GitHub

### 1. Conectarse a EC2

```bash
ssh -i tu-llave.pem ec2-user@tu-ip-publica
# O si usas Ubuntu:
ssh -i tu-llave.pem ubuntu@tu-ip-publica
```

### 2. Navegar al directorio del proyecto

```bash
cd /path/to/dtorreshaus
# Ejemplo común:
cd ~/dtorreshaus
# O si está en /var/www:
cd /var/www/dtorreshaus
```

### 3. Hacer pull de los últimos cambios

```bash
# Ver el branch actual
git branch

# Asegurarse de estar en main (o el branch que usas para producción)
git checkout main

# Hacer pull
git pull origin main

# Si hay cambios locales que quieres conservar:
git stash
git pull origin main
git stash pop
```

---

## 🖥️ Backend Deployment

### 1. Navegar a la carpeta del backend

```bash
cd backend
```

### 2. Instalar dependencias (si hay nuevas)

```bash
npm install
```

### 3. Verificar variables de entorno

```bash
# Asegurarse que el archivo .env existe y tiene todas las variables
cat .env

# Si falta algo, editar:
nano .env
# o
vim .env
```

**Variables importantes a verificar:**
```env
# Database
DATABASE_URL="..."

# Wompi
WOMPI_PUBLIC_KEY="..."
WOMPI_PRIVATE_KEY="..."
WOMPI_EVENTS_SECRET="..."
WOMPI_INTEGRITY_SECRET="..."

# Envia.com
ENVIA_API_KEY="..."

# URLs
FRONTEND_URL="https://tu-dominio.com"
PAYMENT_SUCCESS_URL="https://tu-dominio.com"
```

### 4. Reiniciar el backend con PM2

```bash
# Ver procesos PM2 actuales
pm2 list

# Opción 1: Reiniciar por nombre
pm2 restart dtorreshaus-backend

# Opción 2: Reiniciar por ID
pm2 restart 0  # Reemplaza 0 con el ID correcto

# Opción 3: Reiniciar todos
pm2 restart all

# Ver logs en tiempo real
pm2 logs dtorreshaus-backend --lines 50

# Ver estado
pm2 status
```

### 5. Si el proceso no existe, iniciarlo

```bash
# Iniciar la app
pm2 start npm --name "dtorreshaus-backend" -- start

# O si tienes un script específico:
pm2 start server.js --name "dtorreshaus-backend"

# Guardar la configuración de PM2
pm2 save

# Habilitar PM2 para que inicie en boot
pm2 startup
```

### 6. Verificar que el backend está funcionando

```bash
# Hacer un request de prueba
curl http://localhost:3001/health

# Debería responder:
# {"status":"ok","message":"dtorreshaus API is running"}
```

---

## 🎨 Frontend Deployment

### 1. Navegar a la raíz del proyecto

```bash
cd /path/to/dtorreshaus
```

### 2. Instalar dependencias (si hay nuevas)

```bash
npm install
```

### 3. Verificar variables de entorno del frontend

```bash
# Ver el archivo .env
cat .env

# Debe tener al menos:
cat .env.production  # Si existe
```

**Variables importantes:**
```env
VITE_API_URL=https://api.tu-dominio.com
# O si está en el mismo servidor:
VITE_API_URL=https://tu-dominio.com/api
```

### 4. Construir el frontend

```bash
# Generar build de producción
npm run build

# Esto creará una carpeta 'dist' con los archivos estáticos
```

### 5. Copiar archivos al directorio de Nginx

```bash
# Opción 1: Copiar todo
sudo cp -r dist/* /var/www/html/

# Opción 2: Si tienes un directorio específico
sudo cp -r dist/* /var/www/dtorreshaus/

# Opción 3: Rsync (preserva permisos mejor)
sudo rsync -av --delete dist/ /var/www/html/
```

### 6. Verificar permisos

```bash
# Asignar permisos correctos
sudo chown -R www-data:www-data /var/www/html/
# O en algunos sistemas:
sudo chown -R nginx:nginx /var/www/html/

# Dar permisos de lectura
sudo chmod -R 755 /var/www/html/
```

### 7. Reiniciar Nginx

```bash
# Probar la configuración de Nginx
sudo nginx -t

# Si todo está OK, reiniciar
sudo systemctl restart nginx

# O recargar (más suave):
sudo systemctl reload nginx

# Ver estado
sudo systemctl status nginx

# Ver logs si hay error
sudo tail -f /var/log/nginx/error.log
```

---

## 🔍 Verificación Post-Deployment

### Backend

```bash
# 1. Ver logs del backend
pm2 logs dtorreshaus-backend --lines 100

# 2. Test de health check
curl http://localhost:3001/health

# 3. Test de endpoints específicos
curl http://localhost:3001/api/products
```

### Frontend

```bash
# 1. Ver en navegador
# Abrir: https://tu-dominio.com

# 2. Verificar que carga los assets
curl -I https://tu-dominio.com

# 3. Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Ver logs completos
pm2 logs dtorreshaus-backend --err

# Revisar errores de Node
cd backend
node server.js
# Ctrl+C para salir

# Revisar dependencias
npm install

# Revisar base de datos
npx prisma generate
npx prisma db push
```

### Frontend muestra página en blanco

```bash
# Verificar que se construyó correctamente
ls -la dist/

# Debe tener: index.html, assets/, etc.

# Revisar consola del navegador (F12)
# Buscar errores de CORS o rutas incorrectas

# Verificar variables de entorno
cat .env
```

### Error de CORS

```bash
# Backend - Verificar que permite el dominio correcto
cd backend
nano server.js  # o vim server.js

# Buscar la configuración de CORS:
# app.use(cors({
#   origin: process.env.FRONTEND_URL
# }))

# Verificar que FRONTEND_URL en .env sea correcto
```

### Error 502 Bad Gateway

```bash
# El backend probablemente no está corriendo
pm2 status
pm2 restart dtorreshaus-backend

# Verificar puerto correcto en Nginx
sudo nano /etc/nginx/sites-available/default

# Debe tener algo como:
# proxy_pass http://localhost:3001;
```

---

## 📝 Script Rápido de Deployment

Puedes crear un script para automatizar el proceso:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deployment..."

# Pull código
echo "📥 Descargando cambios..."
git pull origin main

# Backend
echo "🔧 Actualizando backend..."
cd backend
npm install
pm2 restart dtorreshaus-backend
cd ..

# Frontend
echo "🎨 Construyendo frontend..."
npm install
npm run build
sudo rsync -av --delete dist/ /var/www/html/
sudo systemctl reload nginx

echo "✅ Deployment completado!"
echo "🔍 Verificando servicios..."
pm2 status
sudo systemctl status nginx --no-pager

echo "📊 Últimos logs del backend:"
pm2 logs dtorreshaus-backend --lines 10 --nostream
```

Uso:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔐 Seguridad Post-Deployment

1. **Verificar que el .env no esté en el repositorio:**
   ```bash
   cat .gitignore | grep .env
   ```

2. **SSL/HTTPS debe estar activo:**
   ```bash
   sudo certbot renew --dry-run
   ```

3. **Firewall configurado:**
   ```bash
   sudo ufw status
   # Debe permitir: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   ```

---

## 📞 Contacto

Si tienes problemas con el deployment, revisa los logs y asegúrate de que:
- ✅ Todas las variables de entorno estén configuradas
- ✅ El puerto 3001 esté libre para el backend
- ✅ Nginx esté apuntando al puerto correcto
- ✅ Los permisos de archivos sean correctos
- ✅ PM2 esté guardando los procesos (`pm2 save`)

**Happy Deploying! 🎉**
