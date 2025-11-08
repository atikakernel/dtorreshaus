# 💳 Guía Completa de Integración de Pasarelas de Pago

## 📋 Tabla de Contenidos
1. [Estado Actual](#estado-actual)
2. [Qué Necesitas para un Ecommerce 100% Funcional](#qué-necesitas)
3. [PSE - Pagos Seguros en Línea](#pse)
4. [Wompi](#wompi)
5. [Mercado Pago](#mercado-pago)
6. [Arquitectura Backend Necesaria](#arquitectura-backend)
7. [Costos y Comisiones](#costos-y-comisiones)
8. [Roadmap de Implementación](#roadmap)

---

## 🎯 Estado Actual

### ✅ Lo que YA tienes implementado:
- ✅ Frontend completo con React
- ✅ Carrito de compras funcional
- ✅ Sistema de checkout de 3 pasos
- ✅ Interfaz de selección de métodos de pago
- ✅ Cálculo de envíos por ciudad
- ✅ Validación de formularios
- ✅ UI/UX responsive y profesional

### ❌ Lo que FALTA (y por qué):
- ❌ **Backend/Servidor**: Las pasarelas de pago NO pueden procesarse desde el frontend por seguridad
- ❌ **API Keys secretas**: No puedes exponer tus credenciales en el código del navegador
- ❌ **Base de datos**: Para guardar órdenes, transacciones, clientes
- ❌ **Webhooks**: Para recibir confirmaciones de pago
- ❌ **Certificado SSL**: Requerido para procesar pagos (HTTPS)

---

## 🏗️ Qué Necesitas para un Ecommerce 100% Funcional

### 1. **Hosting/Servidor**
Necesitas donde alojar tu backend. Opciones:

#### Opción A: Servidor VPS (Recomendado para producción)
- **AWS EC2**: Desde $5-10 USD/mes
- **DigitalOcean Droplet**: Desde $6 USD/mes
- **Heroku**: Desde $7 USD/mes
- **Railway**: Desde $5 USD/mes

#### Opción B: Serverless (Más económico para empezar)
- **Vercel** (Frontend gratis + Serverless functions)
- **Netlify** (Similar a Vercel)
- **AWS Lambda** + API Gateway
- **Google Cloud Functions**

### 2. **Backend (API)**
Necesitas un servidor que procese los pagos. Tecnologías recomendadas:

```
Frontend (React) → Backend (Node.js/Python/PHP) → Pasarela de Pago
```

**Opciones de tecnología:**
- **Node.js + Express** (más común, JavaScript)
- **Python + Flask/Django** (muy seguro)
- **PHP + Laravel** (tradicional para ecommerce)

### 3. **Base de Datos**
Para almacenar:
- Órdenes de compra
- Estados de transacciones
- Información de clientes
- Inventario de productos

**Opciones:**
- **PostgreSQL** (recomendado, gratis en Railway/Supabase)
- **MongoDB** (NoSQL, gratis en MongoDB Atlas)
- **MySQL** (tradicional, gratis en PlanetScale)

### 4. **Certificado SSL (HTTPS)**
- **OBLIGATORIO** para procesar pagos
- Gratis con Let's Encrypt
- Automático en Vercel, Netlify, Railway

---

## 🇨🇴 PSE - Pagos Seguros en Línea

### ¿Qué es PSE?
Sistema de pagos interbancarios de Colombia que permite pagar con débito directo desde tu banco.

### ⚠️ PSE NO tiene API directa
PSE solo funciona a través de **agregadores/pasarelas**:
- **ePayco**
- **PayU Latam**
- **Mercado Pago**
- **Wompi**

### Implementación con ePayco (Ejemplo)

#### 1. Registro y Credenciales
```
1. Regístrate en: https://dashboard.epayco.co/register
2. Completa verificación de identidad (RUT, cámara de comercio)
3. Obtendrás:
   - P_CUST_ID_CLIENTE (público)
   - P_KEY (público)
   - P_PRIVATE_KEY (¡SECRETO! Solo backend)
```

#### 2. Código Backend (Node.js)
```javascript
// backend/routes/payments.js
const epayco = require('epayco-sdk-node')({
  apiKey: process.env.EPAYCO_PUBLIC_KEY,
  privateKey: process.env.EPAYCO_PRIVATE_KEY,
  lang: 'ES',
  test: true // false en producción
})

app.post('/api/create-pse-payment', async (req, res) => {
  const { customerInfo, cart, total, shippingCost } = req.body

  try {
    const paymentData = {
      // Información de la transacción
      name: "Pedido dtorreshaus",
      description: `${cart.length} productos`,
      invoice: `INV-${Date.now()}`,
      currency: "COP",
      amount: total + shippingCost,
      tax_base: "0",
      tax: "0",
      country: "CO",
      lang: "ES",

      // Información del cliente
      name_billing: customerInfo.name,
      address_billing: customerInfo.address,
      mobilephone_billing: customerInfo.phone,
      email_billing: customerInfo.email,

      // URLs de respuesta
      response: "https://tudominio.com/api/payment-response",
      confirmation: "https://tudominio.com/api/payment-confirmation", // Webhook

      // Método de pago
      methodsDisable: ["CASH", "DP", "SP", "TDC"], // Solo PSE
    }

    const payment = await epayco.bank.create(paymentData)

    // Guardar en base de datos
    await saveOrderToDB({
      orderId: payment.data.ref_payco,
      customerInfo,
      cart,
      total: total + shippingCost,
      status: 'pending'
    })

    res.json({
      success: true,
      paymentUrl: payment.data.urlbanco, // URL del banco para pagar
      reference: payment.data.ref_payco
    })

  } catch (error) {
    console.error('Error PSE:', error)
    res.status(500).json({ error: 'Error procesando pago' })
  }
})

// Webhook para confirmar pago
app.post('/api/payment-confirmation', async (req, res) => {
  const { x_ref_payco, x_transaction_state } = req.body

  // Actualizar orden en base de datos
  if (x_transaction_state === 'Aceptada') {
    await updateOrderStatus(x_ref_payco, 'paid')
    // Enviar email de confirmación
    await sendConfirmationEmail(x_ref_payco)
  }

  res.sendStatus(200)
})
```

#### 3. Código Frontend (React)
```javascript
// En tu componente de checkout
const handlePSEPayment = async () => {
  try {
    const response = await fetch('https://tudominio.com/api/create-pse-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo,
        cart,
        total: cartTotal,
        shippingCost: selectedCity.shippingCost
      })
    })

    const data = await response.json()

    if (data.success) {
      // Redirigir al banco
      window.location.href = data.paymentUrl
    }
  } catch (error) {
    alert('Error procesando pago')
  }
}
```

#### 4. Costos PSE con ePayco
- **Sin cuota mensual**
- **3.5% + $900 COP** por transacción exitosa
- Retiros a tu cuenta: 7 días hábiles

---

## 🔷 Wompi

### ¿Qué es Wompi?
Pasarela de pagos colombiana que acepta:
- Tarjetas de crédito/débito
- Nequi
- PSE
- Bancolombia
- Corresponsales bancarios

### Ventajas de Wompi
- ✅ **Más barato** que ePayco/PayU
- ✅ API moderna y bien documentada
- ✅ Dashboard intuitivo
- ✅ Soporte técnico en español

### Implementación

#### 1. Registro
```
1. Regístrate en: https://comercios.wompi.co/
2. Completa KYC (verificación de identidad)
3. Obtendrás:
   - Public Key: pub_prod_xxxxx (frontend)
   - Private Key: prv_prod_xxxxx (backend)
   - Events Secret: (para verificar webhooks)
```

#### 2. Código Backend (Node.js)
```javascript
// backend/routes/wompi.js
const axios = require('axios')
const crypto = require('crypto')

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET

app.post('/api/create-wompi-payment', async (req, res) => {
  const { customerInfo, cart, total, shippingCost } = req.body

  const reference = `dtorres-${Date.now()}`
  const amountInCents = (total + shippingCost) * 100 // Wompi usa centavos

  try {
    // Crear transacción
    const transaction = {
      acceptance_token: await getAcceptanceToken(), // Ver función abajo
      amount_in_cents: amountInCents,
      currency: "COP",
      customer_email: customerInfo.email,
      payment_method: {
        type: "NEQUI", // o "CARD", "PSE", "BANCOLOMBIA_TRANSFER"
        phone_number: customerInfo.phone // Para Nequi
      },
      reference: reference,
      customer_data: {
        phone_number: customerInfo.phone,
        full_name: customerInfo.name
      },
      shipping_address: {
        address_line_1: customerInfo.address,
        city: customerInfo.city,
        phone_number: customerInfo.phone,
        country: "CO"
      },
      redirect_url: "https://tudominio.com/payment-result"
    }

    const response = await axios.post(
      'https://production.wompi.co/v1/transactions',
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // Guardar en DB
    await saveOrderToDB({
      orderId: reference,
      wompiTransactionId: response.data.data.id,
      customerInfo,
      cart,
      total: total + shippingCost,
      status: 'pending'
    })

    res.json({
      success: true,
      transaction: response.data.data
    })

  } catch (error) {
    console.error('Error Wompi:', error.response?.data || error)
    res.status(500).json({ error: 'Error procesando pago' })
  }
})

// Obtener token de aceptación (requerido por Wompi)
async function getAcceptanceToken() {
  const response = await axios.get(
    'https://production.wompi.co/v1/merchants/' + WOMPI_PUBLIC_KEY
  )
  return response.data.data.presigned_acceptance.acceptance_token
}

// Webhook de Wompi
app.post('/api/wompi-webhook', async (req, res) => {
  const signature = req.headers['x-event-signature']
  const event = req.body

  // Verificar firma del webhook
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(event) + WOMPI_EVENTS_SECRET)
    .digest('hex')

  if (hash !== signature) {
    return res.status(401).send('Invalid signature')
  }

  // Procesar evento
  if (event.event === 'transaction.updated') {
    const transaction = event.data.transaction

    if (transaction.status === 'APPROVED') {
      await updateOrderStatus(transaction.reference, 'paid')
      await sendConfirmationEmail(transaction.reference)
    } else if (transaction.status === 'DECLINED') {
      await updateOrderStatus(transaction.reference, 'failed')
    }
  }

  res.sendStatus(200)
})
```

#### 3. Código Frontend
```javascript
// Cargar script de Wompi
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://checkout.wompi.co/widget.js'
  script.setAttribute('data-render', 'button')
  script.setAttribute('data-public-key', 'pub_prod_xxxxx')
  script.setAttribute('data-currency', 'COP')
  script.setAttribute('data-amount-in-cents', (total * 100).toString())
  script.setAttribute('data-reference', `order-${Date.now()}`)
  document.getElementById('wompi-button').appendChild(script)
}, [total])

// O usando la API directamente
const handleWompiPayment = async () => {
  const response = await fetch('/api/create-wompi-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerInfo, cart, total, shippingCost })
  })

  const data = await response.json()

  if (data.success) {
    // Redirigir o mostrar widget
    window.location.href = data.transaction.payment_link_url
  }
}
```

#### 4. Costos Wompi
- **Sin cuota mensual**
- **2.99% + $800 COP** por transacción con tarjeta
- **1.99% + $700 COP** con Nequi/PSE
- Retiros: 1-2 días hábiles

---

## 💙 Mercado Pago

### ¿Qué es Mercado Pago?
Pasarela de MercadoLibre, acepta todos los métodos de pago en Colombia.

### Ventajas
- ✅ Marca reconocida y confiable
- ✅ Acepta pagos en cuotas
- ✅ Protección al comprador
- ✅ Integración con MercadoLibre

### Implementación

#### 1. Registro
```
1. Regístrate en: https://www.mercadopago.com.co/
2. Ve a: Configuración → Credenciales
3. Obtendrás:
   - Public Key (frontend)
   - Access Token (backend - ¡SECRETO!)
```

#### 2. Instalación SDK
```bash
npm install mercadopago
```

#### 3. Código Backend
```javascript
// backend/routes/mercadopago.js
const mercadopago = require('mercadopago')

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

app.post('/api/create-mercadopago-preference', async (req, res) => {
  const { customerInfo, cart, total, shippingCost } = req.body

  const preference = {
    items: cart.map(item => ({
      title: item.nombre,
      unit_price: item.precio,
      quantity: item.quantity,
      currency_id: "COP"
    })),
    payer: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: { number: customerInfo.phone },
      address: {
        street_name: customerInfo.address,
        city: customerInfo.city
      }
    },
    shipments: {
      cost: shippingCost,
      mode: "custom"
    },
    back_urls: {
      success: "https://tudominio.com/payment-success",
      failure: "https://tudominio.com/payment-failure",
      pending: "https://tudominio.com/payment-pending"
    },
    auto_return: "approved",
    notification_url: "https://tudominio.com/api/mercadopago-webhook",
    external_reference: `dtorres-${Date.now()}`
  }

  try {
    const response = await mercadopago.preferences.create(preference)

    // Guardar orden
    await saveOrderToDB({
      orderId: preference.external_reference,
      mpPreferenceId: response.body.id,
      customerInfo,
      cart,
      total: total + shippingCost,
      status: 'pending'
    })

    res.json({
      success: true,
      preferenceId: response.body.id,
      initPoint: response.body.init_point // URL de pago
    })

  } catch (error) {
    console.error('Error MercadoPago:', error)
    res.status(500).json({ error: 'Error creando preferencia' })
  }
})

// Webhook
app.post('/api/mercadopago-webhook', async (req, res) => {
  const { type, data } = req.body

  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.findById(data.id)
      const externalRef = payment.body.external_reference

      if (payment.body.status === 'approved') {
        await updateOrderStatus(externalRef, 'paid')
        await sendConfirmationEmail(externalRef)
      } else if (payment.body.status === 'rejected') {
        await updateOrderStatus(externalRef, 'failed')
      }
    } catch (error) {
      console.error('Error procesando webhook MP:', error)
    }
  }

  res.sendStatus(200)
})
```

#### 4. Código Frontend
```javascript
// Opción 1: Redirigir a MercadoPago
const handleMercadoPagoPayment = async () => {
  const response = await fetch('/api/create-mercadopago-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerInfo, cart, total, shippingCost })
  })

  const data = await response.json()

  if (data.success) {
    window.location.href = data.initPoint // Redirigir a MercadoPago
  }
}

// Opción 2: Checkout integrado (más complejo, requiere SDK)
```

#### 5. Costos MercadoPago
- **Sin cuota mensual**
- **5.99%** por venta (tarjeta de crédito)
- **4.19%** por venta (débito)
- **3.99%** por venta (PSE)
- Retiros: gratis, disponibles al instante

---

## 🏗️ Arquitectura Backend Necesaria

### Estructura de Proyecto Recomendada

```
dtorreshaus/
├── frontend/                    # Tu React actual
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                     # NUEVO - Necesitas crear esto
│   ├── server.js               # Servidor principal
│   ├── .env                    # Variables de entorno (¡NO subir a git!)
│   ├── package.json
│   │
│   ├── routes/
│   │   ├── payments.js         # Rutas de pagos
│   │   ├── orders.js           # Rutas de órdenes
│   │   └── webhooks.js         # Webhooks de pasarelas
│   │
│   ├── models/
│   │   ├── Order.js            # Modelo de orden
│   │   ├── Payment.js          # Modelo de pago
│   │   └── Customer.js         # Modelo de cliente
│   │
│   ├── services/
│   │   ├── wompi.service.js    # Lógica de Wompi
│   │   ├── mercadopago.service.js
│   │   └── epayco.service.js
│   │
│   └── middleware/
│       ├── auth.js             # Autenticación
│       └── validation.js       # Validación de datos
│
└── database/
    └── migrations/             # Migraciones de DB
```

### Ejemplo de server.js Completo

```javascript
// backend/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { PrismaClient } = require('@prisma/client') // ORM para DB

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(helmet()) // Seguridad
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rutas
app.use('/api/payments', require('./routes/payments'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/webhooks', require('./routes/webhooks'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error)
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
```

### Ejemplo de .env

```env
# .env - ¡NUNCA subir a git!
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dtorreshaus"

# Frontend
FRONTEND_URL=https://tudominio.com

# Wompi
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_EVENTS_SECRET=xxxxx

# MercadoPago
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx

# ePayco (para PSE)
EPAYCO_PUBLIC_KEY=xxxxx
EPAYCO_PRIVATE_KEY=xxxxx
EPAYCO_CUSTOMER_ID=xxxxx

# Email (para confirmaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña
```

---

## 💰 Costos y Comisiones Comparados

| Pasarela | Cuota Mensual | % por Venta | Fijo por Venta | Retiros | Mejor Para |
|----------|---------------|-------------|----------------|---------|------------|
| **Wompi** | $0 | 2.99% - 1.99% | $700-$800 | 1-2 días | Startups, bajo volumen |
| **ePayco** | $0 | 3.5% | $900 | 7 días | PSE, tradicional |
| **MercadoPago** | $0 | 3.99% - 5.99% | $0 | Inmediato | Alto volumen, cuotas |
| **PayU** | $0 | 3.49% + IVA | $900 | 7 días | Empresas establecidas |

### Ejemplo de Comisiones
Venta de **$100.000 COP**:

- **Wompi**: $3.690 (2.99% + $800) = Recibes **$96.310**
- **ePayco**: $4.400 (3.5% + $900) = Recibes **$95.600**
- **MercadoPago**: $5.990 (5.99%) = Recibes **$94.010**

---

## 📝 Roadmap de Implementación

### Fase 1: Preparación (1-2 semanas)
- [ ] Contratar hosting (Vercel/Railway/DigitalOcean)
- [ ] Configurar base de datos (PostgreSQL)
- [ ] Registrarse en pasarelas (Wompi + MercadoPago recomendados)
- [ ] Completar verificación KYC en pasarelas
- [ ] Obtener certificado SSL (automático en Vercel/Railway)

### Fase 2: Backend (2-3 semanas)
- [ ] Crear servidor Express.js
- [ ] Configurar conexión a base de datos
- [ ] Implementar modelos (Order, Payment, Customer)
- [ ] Crear endpoints de pago
- [ ] Implementar webhooks
- [ ] Agregar validaciones y seguridad
- [ ] Testing con ambiente de prueba

### Fase 3: Integración Frontend (1 semana)
- [ ] Conectar checkout actual con API backend
- [ ] Implementar flujos de pago para cada pasarela
- [ ] Agregar manejo de respuestas y errores
- [ ] Crear páginas de confirmación/error
- [ ] Testing end-to-end

### Fase 4: Testing (1 semana)
- [ ] Pruebas con tarjetas de prueba
- [ ] Verificar webhooks funcionan
- [ ] Probar flujo completo de compra
- [ ] Testing de seguridad
- [ ] Performance testing

### Fase 5: Producción (1 semana)
- [ ] Cambiar credenciales a producción
- [ ] Deployment final
- [ ] Configurar monitoring (Sentry, LogRocket)
- [ ] Configurar backups automáticos
- [ ] Crear documentación interna

---

## 🎓 Recursos de Aprendizaje

### Documentación Oficial
- [Wompi API Docs](https://docs.wompi.co/)
- [MercadoPago Developers](https://www.mercadopago.com.co/developers)
- [ePayco API](https://docs.epayco.co/)

### Tutoriales
- [Implementar Wompi con React + Node](https://www.youtube.com/results?search_query=wompi+react+nodejs)
- [MercadoPago SDK](https://github.com/mercadopago/sdk-nodejs)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🚨 Seguridad Crítica

### ❌ NUNCA hagas esto:
```javascript
// ¡MAL! Exponer API key en frontend
const PRIVATE_KEY = "prv_prod_xxxxx" // ¡NUNCA!
```

### ✅ SIEMPRE haz esto:
```javascript
// Backend - Correcto
const PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY // ✅

// Frontend - Solo public keys
const PUBLIC_KEY = "pub_prod_xxxxx" // ✅
```

### Checklist de Seguridad
- [ ] API keys privadas solo en backend
- [ ] Variables sensibles en .env (no en git)
- [ ] HTTPS obligatorio
- [ ] Validar webhooks con firmas
- [ ] Rate limiting en endpoints
- [ ] Sanitizar inputs del usuario
- [ ] Logs de todas las transacciones
- [ ] Backups diarios de base de datos

---

## 💡 Recomendación Final

### Para empezar YA (opción rápida):
1. **Hosting**: Railway.app (gratis, luego $5/mes)
2. **Database**: Railway PostgreSQL (incluido)
3. **Pasarela**: Wompi (más barato, API moderna)
4. **Backend**: Node.js + Express (más fácil si sabes JavaScript)

### Stack recomendado completo:
```
Frontend:  React (Vercel - gratis)
Backend:   Node.js + Express (Railway - $5/mes)
Database:  PostgreSQL (Railway - incluido)
Pagos:     Wompi + MercadoPago
Email:     Resend.com (gratis 3000/mes)
Monitoring: Sentry (gratis tier)
```

**Costo mensual total**: ~$5-10 USD

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar solo el frontend?
No. Las pasarelas de pago REQUIEREN un backend por seguridad.

### ¿Puedo usar Firebase?
Sí, Firebase Functions puede servir como backend serverless.

### ¿Necesito empresa constituida?
Para recibir pagos con volumen alto, sí. Puedes empezar como persona natural.

### ¿Cuánto tarda la verificación KYC?
- Wompi: 1-3 días hábiles
- MercadoPago: 2-5 días hábiles
- ePayco: 3-7 días hábiles

### ¿Qué pasa si un pago falla?
El webhook te notifica y actualizas el estado en DB. El cliente puede reintentar.

---

## 📞 Soporte

Si necesitas ayuda implementando:
1. Revisa la documentación de cada pasarela
2. Únete a comunidades de developers en Discord/Slack
3. Considera contratar un freelancer especializado en pagos

---

**Resumen**: Tu código actual está excelente para el frontend. Para tener pagos reales necesitas:
1. Un servidor backend (Node.js)
2. Una base de datos (PostgreSQL)
3. Registro en pasarelas (Wompi/MercadoPago)
4. Implementar webhooks
5. Deploy con HTTPS

¡Todo esto es completamente factible y lo puedes tener funcionando en 4-6 semanas! 🚀
