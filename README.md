# 🏠 dtorreshaus

Ecommerce completo con pasarelas de pago reales para Colombia.

**🌐 Frontend**: http://dtorreshaus.com
**🔌 Backend API**: http://api.dtorreshaus.com

---

## 📦 Características

- ✅ **136 productos** en 10 categorías
- ✅ **Checkout funcional** con Wompi (Nequi, Tarjetas, PSE)
- ✅ **Backend API** con Express + Node.js
- ✅ **Frontend** en React 18 + Vite
- ✅ **Desplegado en AWS EC2**
- ✅ **Dominios configurados**

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar frontend (puerto 5173)
npm run dev

# El frontend se conecta al backend en producción
# Ver .env.development para configuración
```

### Buildear para Producción

```bash
# Buildear frontend
npm run build

# Desplegar a EC2 (requiere configuración)
./deploy-frontend.sh
```

---

## 📂 Estructura del Proyecto

```
dtorreshaus/
├── src/
│   ├── components/
│   │   └── Checkout.jsx          # Checkout con Wompi
│   ├── services/
│   │   └── api.js                # Cliente API
│   ├── hooks/
│   │   └── useProducts.js        # Hook para productos
│   ├── App.jsx                   # Componente principal
│   ├── productsData.js           # 136 productos
│   └── index.css                 # Estilos
├── backend/
│   ├── server.js                 # Servidor Express
│   ├── routes/                   # Rutas del API
│   ├── services/                 # Lógica de Wompi
│   └── prisma/                   # Schema de DB
├── .env.development              # Config desarrollo
├── .env.production               # Config producción
└── deploy-frontend.sh            # Script de deployment
```

---

## 🛒 Catálogo de Productos

| Categoría | Productos | Ejemplos |
|-----------|-----------|----------|
| 🍳 Cocina | 28 | Vajilla, utensilios, electrodomésticos |
| 🚿 Baño | 11 | Dispensadores, cepillos, accesorios |
| 🧹 Limpieza | 4 | Paños, recogedores, organizadores |
| 📦 Organización | 10 | Contenedores, cestas, cajas |
| 💡 Decoración | 7 | Marcos, jarrones, espejos |
| ⚡ Tecnología | 10 | Gadgets, cargadores, audífonos |
| 💖 Bienestar | 13 | Difusores, mascarillas, yoga |
| 💪 Deportes | 36 | Pesas, bandas, colchonetas |
| 🎁 Labubu | 5 | Figuras coleccionables Pop Mart |
| 🎯 Gel Blasters | 12 | Armas de hidrogel |

**Total**: 136 productos

---

## 💳 Pagos

Integración completa con **Wompi**:
- 💜 **Nequi**
- 💳 **Tarjetas** (Visa, Mastercard, Amex)
- 🏦 **PSE** (Pagos Seguros en Línea)

### Credenciales de Prueba (Test)

**Nequi**: `3001234567`
**Tarjeta**: `4242 4242 4242 4242` / CVV: `123` / Fecha: cualquier futura

---

## 🔧 Configuración

### Variables de Entorno

**Desarrollo** (`.env.development`):
```bash
VITE_API_URL=http://localhost:3001
```

**Producción** (`.env.production`):
```bash
VITE_API_URL=http://api.dtorreshaus.com
```

### Backend (.env en EC2)

```bash
NODE_ENV=production
PORT=3001

# Wompi
WOMPI_PUBLIC_KEY=pub_prod_xxx
WOMPI_PRIVATE_KEY=prv_prod_xxx
WOMPI_EVENTS_SECRET=xxx
```

---

## 📡 API Endpoints

**Base URL**: `http://api.dtorreshaus.com`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/products` | GET | Listar productos |
| `/api/payments/wompi/nequi` | POST | Crear pago Nequi |
| `/api/payments/wompi/card` | POST | Crear pago tarjeta |
| `/api/payments/wompi/pse` | POST | Crear pago PSE |
| `/api/webhooks/wompi` | POST | Webhook de Wompi |

---

## 🚢 Deployment

### Frontend

```bash
# 1. Configurar IP y llave en deploy-frontend.sh
nano deploy-frontend.sh

# 2. Buildear y desplegar
./deploy-frontend.sh
```

### Backend

```bash
# En EC2
cd /var/www/dtorreshaus/dtorreshaus/backend
git pull
npm install
pm2 restart dtorreshaus-backend
```

Ver guía completa: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## 🔒 SSL/HTTPS (Opcional)

```bash
# En EC2
sudo certbot --nginx -d dtorreshaus.com -d www.dtorreshaus.com
sudo certbot --nginx -d api.dtorreshaus.com

# Luego actualizar .env.production:
# VITE_API_URL=https://api.dtorreshaus.com
```

---

## 🧪 Testing

### Test del Backend

```bash
curl http://api.dtorreshaus.com/health
# Respuesta: {"status":"ok","timestamp":"...","uptime":123}
```

### Test del Checkout

1. Abre http://dtorreshaus.com
2. Agrega productos al carrito
3. Click en "Proceder al Pago"
4. Llena el formulario
5. Selecciona método de pago
6. Serás redirigido a Wompi

---

## 📚 Documentación

- **Deployment Completo**: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Scripts útiles**: `deploy-frontend.sh`, `fix-nginx.sh`, `debug-nginx.sh`

---

## 🛠️ Stack Tecnológico

**Frontend**:
- React 18
- Vite 5
- Lucide Icons

**Backend**:
- Node.js 18
- Express
- Prisma (PostgreSQL)
- Wompi SDK

**Infraestructura**:
- AWS EC2 (Ubuntu)
- Nginx
- PM2
- Certbot (SSL)

---

## 📝 Notas

- **Wompi**: Requiere KYC (1-3 días) para producción
- **DNS**: Ya configurado para dtorreshaus.com y api.dtorreshaus.com
- **CORS**: Backend acepta requests desde dtorreshaus.com
- **Fallback**: Si el API falla, usa datos estáticos automáticamente

---

## 🐛 Troubleshooting

### Frontend no carga

```bash
# Verificar archivos
ssh ubuntu@18.224.137.24
ls -la /var/www/dtorreshaus/frontend/

# Ver logs de Nginx
sudo tail -f /var/log/nginx/dtorreshaus.error.log
```

### Backend no responde

```bash
# Ver logs de PM2
pm2 logs dtorreshaus-backend

# Reiniciar
pm2 restart dtorreshaus-backend
```

### Error de CORS

```bash
# Verificar allowed origins en server.js
grep -A 10 "allowedOrigins" backend/server.js

# Reiniciar backend
pm2 restart dtorreshaus-backend
```

---

## 📞 Soporte

Revisa la guía de deployment en [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) para instrucciones detalladas.

---

**© 2024 dtorreshaus - Ecommerce para Colombia** 🇨🇴
