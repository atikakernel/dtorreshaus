# 🚀 Guía de Deployment - dtorreshaus

Guía paso a paso para desplegar tu ecommerce en producción.

---

## 📋 Pre-requisitos

✅ Instancia EC2 con Ubuntu
✅ Node.js 18+ instalado en EC2
✅ PM2 instalado globalmente (`sudo npm i -g pm2`)
✅ Dominios apuntando a tu IP:
  - `dtorreshaus.com` → TU_IP_EC2
  - `www.dtorreshaus.com` → TU_IP_EC2
  - `api.dtorreshaus.com` → TU_IP_EC2

---

## 🎯 Paso 1: Configurar DNS

Ve a tu proveedor de dominios y crea estos registros A:

```
Tipo    Nombre    Valor
----    ------    -----
A       @         18.224.137.24
A       www       18.224.137.24
A       api       18.224.137.24
```

**⏱️ Espera 5-10 minutos** para propagación de DNS.

Verifica:
```bash
nslookup dtorreshaus.com
nslookup api.dtorreshaus.com
```

---

## 🎯 Paso 2: Setup de Nginx

### 2.1 Conectar a EC2

```bash
ssh -i ~/.ssh/tu-llave-ec2.pem ubuntu@18.224.137.24
```

### 2.2 Clonar repositorio (si no lo has hecho)

```bash
cd /var/www/dtorreshaus
git clone https://github.com/TU_USUARIO/dtorreshaus.git dtorreshaus
```

### 2.3 Ejecutar script de setup

```bash
cd /var/www/dtorreshaus/dtorreshaus
chmod +x setup-actual.sh
sudo ./setup-actual.sh
```

Este script:
- Instala Nginx
- Configura virtual hosts para ambos dominios
- Crea directorios necesarios
- Reinicia Nginx

---

## 🎯 Paso 3: Configurar Backend

### 3.1 Instalar dependencias

```bash
cd /var/www/dtorreshaus/dtorreshaus/backend
npm install --production
```

### 3.2 Configurar variables de entorno

```bash
nano .env
```

Agregar:

```bash
NODE_ENV=production
PORT=3001

# Wompi - TEST (para empezar)
WOMPI_PUBLIC_KEY=pub_test_TU_KEY
WOMPI_PRIVATE_KEY=prv_test_TU_KEY
WOMPI_EVENTS_SECRET=TU_SECRET

# Wompi - PRODUCCIÓN (cuando tengas las credenciales)
# WOMPI_PUBLIC_KEY=pub_prod_TU_KEY
# WOMPI_PRIVATE_KEY=prv_prod_TU_KEY
# WOMPI_EVENTS_SECRET=TU_SECRET
```

Guardar: `Ctrl+X` → `Y` → `Enter`

### 3.3 Iniciar con PM2

```bash
pm2 start server.js --name dtorreshaus-backend
pm2 save
pm2 startup  # Copiar y ejecutar el comando que te da
```

### 3.4 Verificar

```bash
pm2 status
pm2 logs dtorreshaus-backend

# Debería mostrar:
# ✅ "dtorreshaus Backend API"
# ✅ "Servidor: http://localhost:3001"
```

---

## 🎯 Paso 4: Desplegar Frontend

### 4.1 Configurar script (en tu máquina local)

```bash
# Editar deploy-frontend.sh
nano deploy-frontend.sh
```

Cambiar:
```bash
EC2_HOST="18.224.137.24"  # Tu IP
EC2_KEY="~/.ssh/tu-llave-ec2.pem"  # Tu llave
```

### 4.2 Ejecutar deployment

```bash
# Buildea el frontend y lo sube a EC2
./deploy-frontend.sh
```

El script:
- Buildea con `npm run build`
- Sube archivos a EC2
- Configura permisos

---

## 🎯 Paso 5: Verificar Todo

### 5.1 Verificar Backend

```bash
# Desde tu máquina local
curl http://api.dtorreshaus.com/health

# Debería ver:
# {"status":"ok","timestamp":"...","uptime":...}
```

### 5.2 Verificar Frontend

Abre en tu navegador:
```
http://dtorreshaus.com
```

Deberías ver tu tienda con los 136 productos.

### 5.3 Test de Checkout

1. Agrega productos al carrito
2. Click en "Proceder al Pago"
3. Llena formulario
4. Selecciona método de pago
5. **IMPORTANTE**: El pago aún no funcionará porque faltan las credenciales de Wompi

---

## 🎯 Paso 6: Configurar Wompi (Para Pagos Reales)

### 6.1 Registrarse en Wompi

1. Ve a https://comercios.wompi.co/
2. Regístrate
3. Completa KYC (1-3 días de aprobación)
4. Obtén tus credenciales:
   - `WOMPI_PUBLIC_KEY` (pub_prod_xxx)
   - `WOMPI_PRIVATE_KEY` (prv_prod_xxx)
   - `WOMPI_EVENTS_SECRET`

### 6.2 Actualizar .env en EC2

```bash
# En EC2
nano /var/www/dtorreshaus/dtorreshaus/backend/.env
```

Actualizar con credenciales de producción:
```bash
WOMPI_PUBLIC_KEY=pub_prod_TU_KEY_REAL
WOMPI_PRIVATE_KEY=prv_prod_TU_KEY_REAL
WOMPI_EVENTS_SECRET=TU_SECRET_REAL
```

### 6.3 Reiniciar backend

```bash
pm2 restart dtorreshaus-backend
pm2 logs dtorreshaus-backend
```

### 6.4 Configurar Webhooks en Wompi

En el panel de Wompi:
- URL de eventos: `http://api.dtorreshaus.com/api/webhooks/wompi`
- Eventos: `transaction.updated`, `transaction.approved`, `transaction.declined`

---

## 🎯 Paso 7: SSL/HTTPS (Opcional pero Recomendado)

### 7.1 Instalar Certbot

```bash
# En EC2
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### 7.2 Obtener certificados

```bash
# Frontend
sudo certbot --nginx -d dtorreshaus.com -d www.dtorreshaus.com

# Backend
sudo certbot --nginx -d api.dtorreshaus.com
```

Responde:
- Email: tu@email.com
- Términos: Y
- Compartir email: N
- Redirect HTTP → HTTPS: 2 (Sí)

### 7.3 Actualizar .env.production

En tu máquina local:

```bash
nano .env.production
```

Cambiar a:
```bash
VITE_API_URL=https://api.dtorreshaus.com
```

### 7.4 Redeploy frontend

```bash
./deploy-frontend.sh
```

### 7.5 Verificar HTTPS

Abre:
- `https://dtorreshaus.com` ✅
- `https://api.dtorreshaus.com/health` ✅

---

## 🔄 Actualizar Código en Producción

### Backend

```bash
# En EC2
cd /var/www/dtorreshaus/dtorreshaus
git pull origin claude/home-labubu-ecommerce-011CUjpGt1LabN6BKe6kQ7Qk
cd backend
npm install
pm2 restart dtorreshaus-backend
pm2 logs dtorreshaus-backend
```

### Frontend

```bash
# En tu máquina local
git pull
./deploy-frontend.sh
```

---

## 🐛 Troubleshooting

### Error: "502 Bad Gateway" en api.dtorreshaus.com

```bash
# Verificar que el backend esté corriendo
pm2 status

# Ver logs
pm2 logs dtorreshaus-backend

# Si no está corriendo, iniciarlo
cd /var/www/dtorreshaus/dtorreshaus/backend
pm2 start server.js --name dtorreshaus-backend
```

### Error: Frontend no se ve (muestra JSON del backend)

```bash
# Verificar configuraciones duplicadas de Nginx
sudo ls -la /etc/nginx/sites-enabled/

# Debería ver SOLO:
# api.dtorreshaus.com
# dtorreshaus.com

# Si hay otros, borrarlos:
sudo rm /etc/nginx/sites-enabled/dtorreshaus-api.conf
sudo rm /etc/nginx/sites-enabled/dtorreshaus-frontend.conf
sudo rm /etc/nginx/sites-enabled/default

# Reiniciar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Error de CORS

```bash
# En EC2, verificar allowed origins
cd /var/www/dtorreshaus/dtorreshaus/backend
grep -A 10 "allowedOrigins" server.js

# Debería incluir:
# 'http://dtorreshaus.com'
# 'https://dtorreshaus.com'

# Si no está, actualizar y reiniciar
pm2 restart dtorreshaus-backend
```

### El pago no funciona

1. Verificar que las credenciales de Wompi estén en `.env`
2. Verificar logs: `pm2 logs dtorreshaus-backend`
3. Asegurarse de estar usando credenciales de TEST primero
4. Ver que el webhook esté configurado en Wompi

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

### Métricas

```bash
pm2 monit  # Monitoreo interactivo
pm2 status  # Estado de procesos
```

---

## ✅ Checklist Final

- [ ] DNS configurado y propagado
- [ ] Nginx instalado y configurado
- [ ] Backend corriendo en PM2
- [ ] Frontend desplegado en `/var/www/dtorreshaus/frontend/`
- [ ] http://dtorreshaus.com muestra la tienda
- [ ] http://api.dtorreshaus.com/health responde
- [ ] Credenciales de Wompi configuradas
- [ ] Webhooks de Wompi configurados
- [ ] SSL/HTTPS configurado (opcional)
- [ ] Checkout funciona end-to-end

---

## 🎉 ¡Listo!

Tu ecommerce ya está en producción. Ahora puedes:

1. **Registrarte en Wompi** para obtener credenciales reales
2. **Configurar SSL** para HTTPS
3. **Agregar más productos** en `src/productsData.js`
4. **Personalizar el diseño** en `src/index.css`

---

**¿Problemas?** Revisa la sección de Troubleshooting o los logs de PM2/Nginx.
