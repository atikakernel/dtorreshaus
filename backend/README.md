# 🛒 dtorreshaus Backend API

Backend API para procesamiento de pagos y gestión de órdenes del ecommerce dtorreshaus.

## 🚀 Quick Start Local

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar base de datos

```bash
# Instalar PostgreSQL en tu computadora
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Crear base de datos
createdb dtorreshaus_db

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev
```

### 4. Iniciar servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

Servidor corriendo en: `http://localhost:3001`

---

## 📁 Estructura del Proyecto

```
backend/
├── server.js                 # Servidor principal
├── package.json
├── .env.example             # Plantilla de variables de entorno
│
├── routes/                  # Rutas de la API
│   ├── payments.js         # POST /api/payments/*
│   ├── orders.js           # GET/PUT /api/orders/*
│   ├── webhooks.js         # POST /api/webhooks/*
│   └── products.js         # GET /api/products/*
│
├── services/               # Lógica de negocio
│   ├── wompi.service.js    # Integración Wompi
│   └── mercadopago.service.js  # Integración MercadoPago
│
├── prisma/                # Base de datos
│   └── schema.prisma      # Schema de Prisma
│
├── deploy/                # Scripts de deployment
│   ├── install-ec2.sh     # Instalación inicial en EC2
│   ├── deploy.sh          # Deployment/actualización
│   └── nginx.conf         # Configuración Nginx
│
└── DEPLOYMENT.md          # Guía completa de deployment
```

---

## 🔌 Endpoints Principales

### Health Check
```bash
GET /health
```

### Pagos con Wompi
```bash
POST /api/payments/wompi/nequi
POST /api/payments/wompi/card
POST /api/payments/wompi/pse
GET  /api/payments/wompi/pse-banks
```

### Pagos con MercadoPago
```bash
POST /api/payments/mercadopago
GET  /api/payments/mercadopago/methods
```

### Órdenes
```bash
GET  /api/orders
GET  /api/orders/:reference
GET  /api/orders/customer/:email
PUT  /api/orders/:reference/status
```

### Webhooks
```bash
POST /api/webhooks/wompi
POST /api/webhooks/mercadopago
```

---

## 🔐 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

Mínimo requerido:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/dtorreshaus_db
FRONTEND_URL=http://localhost:5173

# Al menos una pasarela de pago
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
```

---

## 🧪 Modo de Prueba

Todas las pasarelas tienen modo sandbox/test:

### Wompi Test
- Public Key: `pub_test_xxxxx`
- Private Key: `prv_test_xxxxx`
- Documentación: https://docs.wompi.co/docs/en/test-cards

### MercadoPago Test
- Public Key: `TEST-xxxxx`
- Access Token: `TEST-xxxxx`
- Tarjetas de prueba: https://www.mercadopago.com.co/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🚀 Deployment a Producción

Ver archivo `DEPLOYMENT.md` para guía completa paso a paso.

Resumen rápido:

```bash
# 1. Configurar EC2 (una sola vez)
./deploy/install-ec2.sh

# 2. Deployar código
./deploy/deploy.sh

# 3. Configurar .env en EC2
ssh ubuntu@tu-ec2
nano /var/www/dtorreshaus/backend/.env

# 4. Reiniciar
pm2 restart dtorreshaus-backend
```

---

## 📊 Monitoreo

### PM2 (Producción)
```bash
pm2 status
pm2 logs dtorreshaus-backend
pm2 monit
```

### Logs locales
```bash
# Los logs se imprimen en consola
npm run dev
```

---

## 🗄️ Base de Datos

### Comandos útiles de Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (GUI de base de datos)
npx prisma studio

# Reset de base de datos (¡CUIDADO! Borra todo)
npx prisma migrate reset
```

---

## 🔒 Seguridad

- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de webhooks con firmas
- ✅ Variables sensibles en .env (no en git)
- ✅ HTTPS obligatorio en producción

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
# Mac: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Verificar DATABASE_URL en .env
```

### Error: "Prisma Client is not generated"
```bash
npx prisma generate
```

### Error: "Port 3001 already in use"
```bash
# Cambiar puerto en .env
PORT=3002

# O matar proceso que usa el puerto
lsof -ti:3001 | xargs kill -9
```

---

## 📚 Documentación

- [Guía de Deployment](./DEPLOYMENT.md) - Cómo deployar en EC2
- [Guía de Pasarelas](../PASARELAS-DE-PAGO.md) - Integración detallada de pagos
- [Wompi Docs](https://docs.wompi.co/)
- [MercadoPago Docs](https://www.mercadopago.com.co/developers)
- [Prisma Docs](https://www.prisma.io/docs)

---

## 🤝 Contribuir

Este es un proyecto privado para dtorreshaus.

---

## 📄 Licencia

MIT

---

**¿Necesitas ayuda?** Revisa la documentación en `DEPLOYMENT.md` o `PASARELAS-DE-PAGO.md`
