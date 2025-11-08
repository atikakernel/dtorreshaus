# 🔌 Guía: Conectar Frontend con Backend

Esta guía te ayudará a conectar tu frontend de React con el backend API para tener un ecommerce 100% funcional con pagos reales.

---

## 📋 Lo que acabamos de crear:

1. ✅ **Servicio API** (`src/services/api.js`)
   - Funciones para comunicarse con el backend
   - Endpoints de productos, órdenes y pagos

2. ✅ **Hook personalizado** (`src/hooks/useProducts.js`)
   - Carga productos desde el API
   - Fallback automático a datos estáticos si el API falla

3. ✅ **Componente Checkout** (`src/components/Checkout.jsx`)
   - Integración real con Wompi (Nequi, Tarjeta, PSE)
   - Manejo de errores y estados de loading

4. ✅ **Variables de entorno** (`.env.development`, `.env.production`)
   - Configuración de URL del API según ambiente

---

## 🚀 Cómo Funciona (Sin modificar App.jsx por ahora)

**La buena noticia**: Tu frontend ya está casi listo para funcionar con el backend.

**Para testear la conexión**:

1. Abre http://dtorreshaus.com en tu navegador
2. Abre la consola del navegador (F12)
3. Ejecuta estos comandos para probar el API:

```javascript
// Verificar salud del API
fetch('http://api.dtorreshaus.com/health')
  .then(r => r.json())
  .then(console.log)

// Ver productos
fetch('http://api.dtorreshaus.com/api/products')
  .then(r => r.json())
  .then(console.log)
```

---

## 🎯 Integración Básica (Recomendado para empezar)

No necesitas modificar todo App.jsx ahora mismo. Puedes integrar el checkout real sin tocar los productos.

### Paso 1: Importar el componente Checkout

En `src/App.jsx`, al inicio con los demás imports:

```javascript
import { Checkout } from './components/Checkout'
```

### Paso 2: Reemplazar el checkout de placeholder

Busca donde tienes el código del modal de pago (probablemente donde dice "payment") y reemplázalo por:

```jsx
{checkoutStep === 'payment' && (
  <Checkout
    cart={cart}
    total={totalPrice}
    shippingCost={selectedCity ? colombianCities.find(c => c.name === customerInfo.city)?.shippingCost || 0 : 0}
    customerInfo={customerInfo}
    onClose={() => {
      setIsCheckoutOpen(false)
      setCheckoutStep('info')
    }}
    onSuccess={(result) => {
      console.log('Pago exitoso:', result)
      // Aquí puedes mostrar mensaje de éxito
      setCheckoutStep('confirmation')
    }}
  />
)}
```

**¡Y listo!** Ahora cuando un usuario vaya a pagar:
1. Verá las opciones de Nequi, Tarjeta o PSE
2. Al seleccionar y dar click en "Pagar", se creará una transacción real en Wompi
3. Será redirigido a Wompi para completar el pago
4. Wompi procesará el pago y notificará a tu backend

---

## 🔧 Integración Avanzada (Opcional)

Si quieres que los productos también se carguen del API:

### Paso 1: Importar el hook

En `src/App.jsx`:

```javascript
import { useProducts } from './hooks/useProducts'
```

### Paso 2: Usar el hook en lugar de import estático

Reemplaza:
```javascript
import { productsData } from './productsData.js'
```

Y en la función `App()`:

```javascript
function App() {
  const { products: productsData, loading } = useProducts()

  // ... resto del código
```

Agrega un indicador de carga:

```jsx
return (
  <div className="app">
    {loading && (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Cargando productos...
      </div>
    )}

    {!loading && (
      // ... tu código actual del return
    )}
  </div>
)
```

---

## 🧪 Testing

### 1. Test del Backend

```bash
# En tu máquina local
curl http://api.dtorreshaus.com/health
# Deberías ver: {"status":"ok",...}

curl http://api.dtorreshaus.com/api/products
# Deberías ver: tus 136 productos
```

### 2. Test del Checkout (Desarrollo Local)

```bash
# Iniciar frontend en desarrollo
npm run dev
```

1. Agrega productos al carrito
2. Llena el formulario de información
3. Click en "Continuar al pago"
4. Selecciona Nequi/Tarjeta/PSE
5. Click en "Pagar Ahora"

**IMPORTANTE**: Para test, usa credenciales de prueba:
- Nequi: `3001234567`
- Tarjeta: `4242 4242 4242 4242` / CVV: `123`

### 3. Test en Producción

Mismo flujo, pero antes necesitas configurar credenciales de Wompi.

---

## 📝 Configurar Wompi (Para Pagos Reales)

### 1. Obtener Credenciales de Wompi

1. Ve a https://comercios.wompi.co/
2. Regístrate/Inicia sesión
3. Completa la información de tu negocio (KYC)
4. Obtén tus credenciales:
   - `WOMPI_PUBLIC_KEY` (pub_test_xxx → pub_prod_xxx)
   - `WOMPI_PRIVATE_KEY` (prv_test_xxx → prv_prod_xxx)
   - `WOMPI_EVENTS_SECRET` (para webhooks)

### 2. Configurar en el Backend

```bash
# Conectarte a EC2
ssh -i ~/.ssh/tu-llave.pem ubuntu@18.224.137.24

# Editar variables de entorno
cd /var/www/dtorreshaus/dtorreshaus/backend
nano .env
```

Agregar:

```bash
NODE_ENV=production
PORT=3001

# Wompi - Producción
WOMPI_PUBLIC_KEY=pub_prod_TU_KEY
WOMPI_PRIVATE_KEY=prv_prod_TU_KEY
WOMPI_EVENTS_SECRET=TU_SECRET

# Frontend URL (para CORS)
FRONTEND_URL=http://dtorreshaus.com
```

Guardar (`Ctrl+X`, `Y`, `Enter`)

### 3. Reiniciar Backend

```bash
pm2 restart dtorreshaus-backend
pm2 logs dtorreshaus-backend
```

### 4. Configurar Webhooks en Wompi

En el panel de Wompi:
- URL de eventos: `http://api.dtorreshaus.com/api/webhooks/wompi`
- Eventos a suscribir:
  - `transaction.updated`
  - `transaction.approved`
  - `transaction.declined`

---

## 🔄 Flujo Completo

```
1. Usuario agrega productos al carrito en http://dtorreshaus.com
   ↓
2. Usuario llena formulario de checkout
   ↓
3. Usuario selecciona método de pago (Nequi/Tarjeta/PSE)
   ↓
4. Frontend envía request a http://api.dtorreshaus.com/api/payments/wompi/nequi
   ↓
5. Backend crea transacción en Wompi
   ↓
6. Backend devuelve URL de pago de Wompi
   ↓
7. Usuario es redirigido a Wompi para pagar
   ↓
8. Usuario completa el pago en Wompi
   ↓
9. Wompi envía webhook a http://api.dtorreshaus.com/api/webhooks/wompi
   ↓
10. Backend actualiza estado de la orden a "paid"
   ↓
11. (Opcional) Backend envía email de confirmación
   ↓
12. Usuario es redirigido de vuelta a tu sitio con mensaje de éxito
```

---

## 🐛 Problemas Comunes

### "Failed to fetch" o "CORS error"

**Solución**: Verifica que el backend tenga tu dominio en la lista de orígenes permitidos:

```bash
# En EC2
cd /var/www/dtorreshaus/dtorreshaus/backend
nano server.js
```

Busca `allowedOrigins` y verifica que esté:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://dtorreshaus.com',
  'http://www.dtorreshaus.com'
]
```

Luego reinicia:
```bash
pm2 restart dtorreshaus-backend
```

### El pago no funciona

1. Verifica logs del backend:
   ```bash
   pm2 logs dtorreshaus-backend
   ```

2. Verifica que las credenciales de Wompi estén en `.env`

3. Verifica que el puerto 3001 esté corriendo:
   ```bash
   curl http://localhost:3001/health
   ```

---

## ✅ Checklist

- [ ] Backend corriendo en EC2 (`pm2 status`)
- [ ] Frontend desplegado en http://dtorreshaus.com
- [ ] Componente Checkout importado en App.jsx
- [ ] Checkout integrado en el flujo de pago
- [ ] Variables de entorno configuradas
- [ ] Credenciales de Wompi configuradas (test primero)
- [ ] Flujo de pago testeado
- [ ] Webhooks de Wompi configurados (para producción)
- [ ] SSL configurado (opcional: https)

---

## 🎉 Próximos Pasos (Opcional)

### 1. Configurar SSL/HTTPS

```bash
# En EC2
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dtorreshaus.com -d www.dtorreshaus.com
sudo certbot --nginx -d api.dtorreshaus.com
```

Luego actualiza `.env.production`:
```
VITE_API_URL=https://api.dtorreshaus.com
```

Y redespliega el frontend:
```bash
./deploy-frontend.sh
```

### 2. Email de Confirmación

El backend ya tiene preparado el código para enviar emails. Solo necesitas configurar SMTP en `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu_password_de_app
```

---

## 📊 Archivos Creados

```
src/
├── services/
│   └── api.js              ← Cliente para hablar con el backend
├── hooks/
│   └── useProducts.js      ← Hook para cargar productos (opcional)
└── components/
    └── Checkout.jsx        ← Componente de checkout real

.env.development            ← Variables para desarrollo
.env.production             ← Variables para producción
```

---

**¿Listo para probarlo?** Agrega el import del `Checkout` en tu App.jsx y prueba hacer un pago de test! 🚀
