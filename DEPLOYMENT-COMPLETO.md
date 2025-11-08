# 🚀 Guía de Deployment Completo - dtorreshaus

Esta guía te llevará paso a paso para desplegar tu ecommerce en producción con:
- **Frontend**: `dtorreshaus.com` (React)
- **Backend**: `api.dtorreshaus.com` (Node.js)
- **SSL/HTTPS**: Certificados gratuitos con Let's Encrypt

---

## 📋 Pre-requisitos

✅ Instancia EC2 corriendo Ubuntu
✅ Dominios apuntando a tu IP de EC2:
  - `dtorreshaus.com`
  - `www.dtorreshaus.com`
  - `api.dtorreshaus.com`

✅ Acceso SSH a tu EC2
✅ Node.js 18+ instalado en EC2
✅ PM2 instalado globalmente en EC2

---

## 🎯 PASO 1: Configurar DNS

Ve a tu proveedor de dominios (GoDaddy, Namecheap, etc.) y crea estos registros:

```
Tipo    Nombre                  Valor
----    ------                  -----
A       @                       TU_IP_EC2
A       www                     TU_IP_EC2
A       api                     TU_IP_EC2
```

**⏱️ Espera 5-10 minutos** para que se propaguen los DNS.

Verifica con:
```bash
nslookup dtorreshaus.com
nslookup api.dtorreshaus.com
```

---

## 🎯 PASO 2: Setup Inicial de EC2

### 2.1. Conectarte a EC2

```bash
ssh -i ~/.ssh/tu-llave-ec2.pem ubuntu@TU_IP_EC2
```

### 2.2. Actualizar sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2.3. Instalar Node.js 18 (si no está instalado)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Debe ser v18+
```

### 2.4. Instalar PM2 (si no está instalado)

```bash
sudo npm install -g pm2
pm2 --version
```

### 2.5. Instalar Git (si no está instalado)

```bash
sudo apt-get install -y git
```

---

## 🎯 PASO 3: Configurar Nginx y Dominios

### 3.1. Subir script de setup

Desde tu máquina local:

```bash
scp -i ~/.ssh/tu-llave-ec2.pem \
  backend/deploy/setup-ec2-complete.sh \
  ubuntu@TU_IP_EC2:~/
```

### 3.2. Ejecutar setup en EC2

```bash
# En EC2
chmod +x ~/setup-ec2-complete.sh
sudo ~/setup-ec2-complete.sh
```

Este script:
- ✅ Instala Nginx
- ✅ Crea directorios `/var/www/dtorreshaus/`
- ✅ Configura virtual hosts para ambos dominios
- ✅ Reinicia Nginx

### 3.3. Verificar Nginx

```bash
sudo systemctl status nginx
sudo nginx -t
```

---

## 🎯 PASO 4: Desplegar el Backend

### 4.1. Clonar repositorio

```bash
# En EC2
cd /var/www/dtorreshaus
git clone https://github.com/TU_USUARIO/dtorreshaus.git backend
cd backend
```

O si ya lo clonaste antes:

```bash
cd /var/www/dtorreshaus/backend
git pull origin claude/home-labubu-ecommerce-011CUjpGt1LabN6BKe6kQ7Qk
```

### 4.2. Instalar dependencias

```bash
npm install --production
```

### 4.3. Configurar variables de entorno

```bash
nano .env
```

Agregar:

```bash
NODE_ENV=production
PORT=3001

# Wompi
WOMPI_PUBLIC_KEY=pub_test_TU_KEY
WOMPI_PRIVATE_KEY=prv_test_TU_KEY
WOMPI_EVENTS_SECRET=TU_SECRET

# MercadoPago (opcional si solo usas Wompi)
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY

# PostgreSQL (si lo usas)
DATABASE_URL=postgresql://usuario:password@localhost:5432/dtorreshaus_db

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu_password
```

Guardar con `Ctrl+X`, `Y`, `Enter`.

### 4.4. Iniciar con PM2

```bash
pm2 start server.js --name dtorreshaus-backend
pm2 save
pm2 startup  # Copia y ejecuta el comando que te da
```

### 4.5. Verificar backend

```bash
pm2 logs dtorreshaus-backend

# En otra terminal:
curl http://localhost:3001/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"2025-11-08T..."}
```

### 4.6. Verificar desde dominio (sin SSL todavía)

```bash
curl http://api.dtorreshaus.com/health
```

---

## 🎯 PASO 5: Desplegar el Frontend

### 5.1. Configurar script de deployment (en tu máquina local)

Edita `deploy-frontend.sh`:

```bash
EC2_USER="ubuntu"
EC2_HOST="TU_IP_EC2"  # ⚠️ CAMBIAR
EC2_KEY="~/.ssh/tu-llave-ec2.pem"  # ⚠️ CAMBIAR
```

### 5.2. Hacer script ejecutable

```bash
chmod +x deploy-frontend.sh
```

### 5.3. Buildear y desplegar

```bash
# Esto buildeará el frontend con la URL de producción
# y subirá los archivos a EC2
./deploy-frontend.sh
```

El script:
- ✅ Buildea el proyecto con `npm run build`
- ✅ Sube el directorio `dist/` a `/var/www/dtorreshaus/frontend/`
- ✅ Configura permisos correctos

### 5.4. Verificar frontend (sin SSL)

Abre en tu navegador:
```
http://dtorreshaus.com
```

Deberías ver tu tienda! 🎉

---

## 🎯 PASO 6: Configurar SSL/HTTPS con Let's Encrypt

### 6.1. Instalar Certbot

```bash
# En EC2
sudo apt-get install -y certbot python3-certbot-nginx
```

### 6.2. Obtener certificado para frontend

```bash
sudo certbot --nginx -d dtorreshaus.com -d www.dtorreshaus.com
```

Responde:
- Email: `tu@email.com`
- Términos: `Y`
- Compartir email: `N` (opcional)
- Redirect HTTP → HTTPS: `2` (Sí, redirect)

### 6.3. Obtener certificado para backend

```bash
sudo certbot --nginx -d api.dtorreshaus.com
```

Responde igual que arriba.

### 6.4. Verificar renovación automática

```bash
sudo certbot renew --dry-run
```

Si sale OK, los certificados se renovarán automáticamente cada 90 días.

---

## 🎯 PASO 7: Verificación Final

### 7.1. Verificar HTTPS

✅ Frontend:
```
https://dtorreshaus.com
https://www.dtorreshaus.com
```

✅ Backend:
```
https://api.dtorreshaus.com/health
```

### 7.2. Verificar redirect HTTP → HTTPS

Abre `http://dtorreshaus.com` (sin S)
→ Debería redirigir a `https://dtorreshaus.com`

### 7.3. Verificar CORS

En tu frontend, abre la consola del navegador y verifica que no haya errores de CORS cuando hagas requests al API.

### 7.4. Verificar PM2

```bash
# En EC2
pm2 status
pm2 logs dtorreshaus-backend
```

---

## 🔄 Actualizar Código en Producción

### Backend

```bash
# En EC2
cd /var/www/dtorreshaus/backend
git pull origin claude/home-labubu-ecommerce-011CUjpGt1LabN6BKe6kQ7Qk
npm install
pm2 restart dtorreshaus-backend
pm2 logs dtorreshaus-backend
```

### Frontend

```bash
# En tu máquina local
./deploy-frontend.sh
```

---

## 🐛 Troubleshooting

### Error: "502 Bad Gateway" en api.dtorreshaus.com

```bash
# Verificar que el backend esté corriendo
pm2 status
pm2 logs dtorreshaus-backend

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Error: "Cannot GET /" en dtorreshaus.com

```bash
# Verificar que los archivos estén en el directorio correcto
ls -la /var/www/dtorreshaus/frontend/

# Debería tener: index.html, assets/, etc.
```

### Error de CORS en el navegador

```bash
# Verificar que el backend tenga los orígenes correctos
cd /var/www/dtorreshaus/backend
grep -A 10 "allowedOrigins" server.js

# Reiniciar backend
pm2 restart dtorreshaus-backend
```

### Certificado SSL no funciona

```bash
# Ver logs de Certbot
sudo certbot certificates

# Forzar renovación
sudo certbot renew --force-renewal
```

---

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
# Backend
pm2 logs dtorreshaus-backend

# Nginx - Frontend
sudo tail -f /var/log/nginx/dtorreshaus.access.log
sudo tail -f /var/log/nginx/dtorreshaus.error.log

# Nginx - Backend
sudo tail -f /var/log/nginx/api.dtorreshaus.access.log
sudo tail -f /var/log/nginx/api.dtorreshaus.error.log
```

### Métricas de PM2

```bash
pm2 monit
```

---

## 🎉 ¡Listo!

Tu ecommerce ahora está en producción con:

✅ **Frontend**: https://dtorreshaus.com
✅ **Backend**: https://api.dtorreshaus.com
✅ **SSL/HTTPS**: Certificados gratuitos renovándose automáticamente
✅ **136 productos**: Desde hogar hasta Labubu y Gel Blasters
✅ **Pasarelas de pago**: Wompi (Nequi, PSE, Tarjetas)

---

## 🔐 Seguridad Adicional (Opcional)

### Configurar firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Configurar fail2ban

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backups automáticos

Configura backups de:
- Base de datos PostgreSQL (si la usas)
- Archivos de configuración `.env`
- Código del repositorio (ya lo tienes en Git)

---

**¿Problemas?** Revisa la sección de Troubleshooting o los logs. 🔍
