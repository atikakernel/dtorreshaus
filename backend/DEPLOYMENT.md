# 🚀 Guía Completa de Deployment en EC2

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener:

- ✅ Instancia EC2 creada (Ubuntu 22.04 LTS recomendado)
- ✅ Par de llaves SSH (.pem) guardado en tu computadora
- ✅ Security Group configurado con puertos:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3001 (Backend temporal)
- ✅ Dominio configurado (opcional pero recomendado)
  - api.tudominio.com → IP de tu EC2
- ✅ Credenciales de Wompi y/o MercadoPago

---

## 🎯 Paso 1: Conectarse a EC2

### 1.1 Obtener la IP pública de tu EC2

```bash
# En AWS Console → EC2 → Instances
# Copiar "Public IPv4 address"
# Ejemplo: 54.123.456.789
```

### 1.2 Conectarse por SSH

```bash
# Dar permisos a la llave
chmod 400 ~/.ssh/tu-llave-ec2.pem

# Conectarse (Ubuntu)
ssh -i ~/.ssh/tu-llave-ec2.pem ubuntu@54.123.456.789

# Conectarse (Amazon Linux)
ssh -i ~/.ssh/tu-llave-ec2.pem ec2-user@54.123.456.789
```

---

## 🛠️ Paso 2: Instalación Inicial en EC2

### 2.1 Copiar script de instalación

```bash
# Desde tu computadora LOCAL (NO en EC2)
cd dtorreshaus/backend/deploy

# Dar permisos de ejecución
chmod +x install-ec2.sh

# Copiar a EC2
scp -i ~/.ssh/tu-llave-ec2.pem install-ec2.sh ubuntu@54.123.456.789:~
```

### 2.2 Ejecutar instalación en EC2

```bash
# Conectarse a EC2
ssh -i ~/.ssh/tu-llave-ec2.pem ubuntu@54.123.456.789

# Ejecutar script
chmod +x install-ec2.sh
./install-ec2.sh
```

Este script instala:
- ✅ Node.js 18
- ✅ PostgreSQL
- ✅ PM2 (gestor de procesos)
- ✅ Nginx (reverse proxy)
- ✅ Certbot (SSL gratis)
- ✅ Configuración de firewall

**⏱️ Tiempo estimado: 5-10 minutos**

---

## 📝 Paso 3: Configurar Base de Datos

### 3.1 Cambiar contraseña de PostgreSQL

```bash
# Conectado en EC2
sudo -u postgres psql

# Cambiar contraseña
ALTER USER dtorreshaus WITH PASSWORD 'TU_PASSWORD_SUPER_SEGURO_AQUI';
\q
```

### 3.2 Probar conexión

```bash
# Probar que funciona
psql -U dtorreshaus -d dtorreshaus_db -h localhost

# Si pide contraseña, todo está bien ✅
# Salir con: \q
```

---

## 🚀 Paso 4: Deployar el Backend

### 4.1 Configurar deploy.sh

Edita `backend/deploy/deploy.sh` con tus datos:

```bash
# CONFIGURACIÓN - EDITA ESTOS VALORES
EC2_USER="ubuntu"                           # Tu usuario
EC2_HOST="54.123.456.789"                  # Tu IP de EC2
EC2_KEY="~/.ssh/tu-llave-ec2.pem"          # Tu llave SSH
REMOTE_DIR="/var/www/dtorreshaus/backend"  # Directorio destino
```

### 4.2 Ejecutar deployment

```bash
# Desde tu computadora LOCAL (NO en EC2)
cd dtorreshaus/backend/deploy

# Dar permisos
chmod +x deploy.sh

# Deployar
./deploy.sh
```

Este script:
- ✅ Sube todos los archivos a EC2
- ✅ Instala dependencias
- ✅ Genera Prisma Client
- ✅ Inicia aplicación con PM2

**⏱️ Tiempo estimado: 2-3 minutos**

---

## 🔐 Paso 5: Configurar Variables de Entorno

### 5.1 Conectarse a EC2 y editar .env

```bash
# Conectarse
ssh -i ~/.ssh/tu-llave-ec2.pem ubuntu@54.123.456.789

# Ir al directorio
cd /var/www/dtorreshaus/backend

# Editar .env
nano .env
```

### 5.2 Configuración MÍNIMA requerida

```env
# ====================================
# PRODUCCIÓN - dtorreshaus
# ====================================

NODE_ENV=production
PORT=3001

# Frontend
FRONTEND_URL=https://tudominio.com

# Base de datos
DATABASE_URL="postgresql://dtorreshaus:TU_PASSWORD_AQUI@localhost:5432/dtorreshaus_db"

# Wompi (si vas a usar)
WOMPI_PUBLIC_KEY=pub_prod_XXXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXXX
WOMPI_EVENTS_SECRET=prod_events_XXXXX

# MercadoPago (si vas a usar)
MERCADOPAGO_PUBLIC_KEY=APP_USR-XXXXX
MERCADOPAGO_ACCESS_TOKEN=APP_USR-XXXXX

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=ventas@dtorreshaus.com

# JWT
JWT_SECRET=cambia_esto_por_un_string_aleatorio_super_largo_y_seguro

# URLs
BACKEND_URL=https://api.tudominio.com
PAYMENT_SUCCESS_URL=https://tudominio.com/payment-success
PAYMENT_FAILURE_URL=https://tudominio.com/payment-failure
PAYMENT_PENDING_URL=https://tudominio.com/payment-pending
```

**💾 Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.3 Reiniciar aplicación

```bash
pm2 restart dtorreshaus-backend
pm2 save
```

---

## 🗄️ Paso 6: Configurar Base de Datos (Prisma)

```bash
# Conectado en EC2
cd /var/www/dtorreshaus/backend

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones (crear tablas)
npx prisma migrate deploy

# Ver tablas creadas
npx prisma studio --port 5555
```

Para acceder a Prisma Studio desde tu navegador:
1. En tu computadora local: `ssh -L 5555:localhost:5555 -i ~/.ssh/tu-llave.pem ubuntu@IP-EC2`
2. Abrir: `http://localhost:5555`

---

## 🌐 Paso 7: Configurar Nginx (Reverse Proxy)

### 7.1 Copiar configuración de Nginx

```bash
# Conectado en EC2
sudo nano /etc/nginx/sites-available/dtorreshaus
```

Pega el contenido de `backend/deploy/nginx.conf` (ya está creado en el proyecto)

**IMPORTANTE:** Cambia `api.dtorreshaus.com` por tu dominio real

### 7.2 Activar sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/dtorreshaus /etc/nginx/sites-enabled/

# Desactivar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Si todo OK, reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 Paso 8: Configurar SSL (HTTPS)

### 8.1 Asegúrate de que tu dominio apunte a EC2

```bash
# Desde tu computadora, probar DNS
nslookup api.tudominio.com
# Debe devolver la IP de tu EC2
```

### 8.2 Obtener certificado SSL gratis

```bash
# Conectado en EC2
sudo certbot --nginx -d api.tudominio.com

# Seguir instrucciones:
# 1. Ingresar email
# 2. Aceptar términos
# 3. ¿Recibir emails? (opcional)
# 4. ¿Redirigir HTTP a HTTPS? YES (recomendado)
```

Certbot configurará automáticamente el SSL en Nginx ✅

### 8.3 Renovación automática

```bash
# Probar renovación
sudo certbot renew --dry-run

# Si funciona, crear cron job
sudo crontab -e

# Agregar esta línea (renovar cada día a las 3am):
0 3 * * * certbot renew --quiet
```

---

## ✅ Paso 9: Verificar que Todo Funciona

### 9.1 Probar endpoints

```bash
# Health check
curl https://api.tudominio.com/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2024-...","environment":"production"}

# Test de ruta principal
curl https://api.tudominio.com/

# Obtener bancos PSE de Wompi
curl https://api.tudominio.com/api/payments/wompi/pse-banks
```

### 9.2 Probar desde el frontend

Actualiza tu frontend para apuntar a la API:

```javascript
// src/config.js (crear este archivo)
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.tudominio.com'
  : 'http://localhost:3001'
```

---

## 📊 Paso 10: Monitoreo

### 10.1 Ver logs de PM2

```bash
# Ver logs en tiempo real
pm2 logs dtorreshaus-backend

# Ver logs de las últimas 100 líneas
pm2 logs dtorreshaus-backend --lines 100

# Ver solo errores
pm2 logs dtorreshaus-backend --err
```

### 10.2 Comandos útiles de PM2

```bash
# Ver status
pm2 status

# Reiniciar
pm2 restart dtorreshaus-backend

# Detener
pm2 stop dtorreshaus-backend

# Ver métricas
pm2 monit

# Ver info detallada
pm2 show dtorreshaus-backend
```

### 10.3 Ver logs de Nginx

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/dtorreshaus-access.log

# Logs de errores
sudo tail -f /var/log/nginx/dtorreshaus-error.log
```

---

## 🔄 Paso 11: Actualizar el Backend

Cuando hagas cambios en el código:

```bash
# Desde tu computadora LOCAL
cd dtorreshaus/backend/deploy
./deploy.sh

# Listo! El script:
# 1. Sube los nuevos archivos
# 2. Instala dependencias
# 3. Reinicia PM2
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused" al hacer curl

```bash
# Verificar que el backend está corriendo
pm2 status

# Si no está corriendo
pm2 start server.js --name dtorreshaus-backend

# Ver logs
pm2 logs dtorreshaus-backend
```

### Problema: Error de base de datos

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciar si está detenido
sudo systemctl start postgresql

# Probar conexión manual
psql -U dtorreshaus -d dtorreshaus_db -h localhost
```

### Problema: Nginx muestra "502 Bad Gateway"

```bash
# Verificar que el backend está en puerto 3001
curl localhost:3001/health

# Verificar configuración de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: SSL no funciona

```bash
# Verificar que el dominio apunta a EC2
nslookup api.tudominio.com

# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew
```

---

## 📝 Checklist Final

Antes de considerar el deployment completo, verifica:

- [ ] ✅ Backend responde en `https://api.tudominio.com/health`
- [ ] ✅ Base de datos PostgreSQL conectada
- [ ] ✅ PM2 corriendo (pm2 status)
- [ ] ✅ Nginx configurado como reverse proxy
- [ ] ✅ SSL (HTTPS) funcionando
- [ ] ✅ Variables de entorno (.env) configuradas
- [ ] ✅ Webhooks de pasarelas configurados:
  - Wompi: `https://api.tudominio.com/api/webhooks/wompi`
  - MercadoPago: `https://api.tudominio.com/api/webhooks/mercadopago`
- [ ] ✅ Frontend apunta a la API de producción
- [ ] ✅ Firewall (UFW) configurado
- [ ] ✅ Logs funcionando correctamente

---

## 🎉 ¡Felicidades!

Tu backend está en producción y listo para procesar pagos reales.

### Próximos pasos:

1. **Configurar webhooks en las pasarelas**:
   - Wompi: Dashboard → Configuración → Webhooks → `https://api.tudominio.com/api/webhooks/wompi`
   - MercadoPago: Configuración → Webhooks → `https://api.tudominio.com/api/webhooks/mercadopago`

2. **Probar flujo completo**:
   - Crear orden desde el frontend
   - Pagar con tarjeta de prueba
   - Verificar que se actualiza en base de datos
   - Verificar email de confirmación (si configuraste SMTP)

3. **Monitorear**:
   - Revisar logs diariamente
   - Configurar alertas (opcional: Sentry, LogRocket)
   - Hacer backups de base de datos

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `pm2 logs dtorreshaus-backend`
2. Verifica la configuración: `.env` y `nginx.conf`
3. Consulta la documentación de las pasarelas
4. Revisa el archivo `PASARELAS-DE-PAGO.md` del proyecto

---

**¡Tu ecommerce está listo para vender! 🛒💰**
