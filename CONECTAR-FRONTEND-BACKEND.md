# 🔌 Conectar Frontend con Backend

Guía para integrar tu frontend React con el backend API.

---

## 📝 Paso 1: Configurar Variables de Entorno en Frontend

### 1.1 Crear archivo de configuración

```bash
# Crear archivo en la raíz del proyecto
touch .env.local
```

### 1.2 Agregar URL del backend

```env
# .env.local
VITE_API_URL=http://localhost:3001
```

En producción cambiará a:
```env
VITE_API_URL=https://api.tudominio.com
```

---

## 🛠️ Paso 2: Crear Servicio API

### 2.1 Crear archivo src/services/api.js

```javascript
// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Crear pago con Wompi Nequi
 */
export async function createWompiNequiPayment(paymentData) {
  const { customerInfo, cart, total, shippingCost, shippingAddress } = paymentData

  try {
    const response = await fetch(`${API_URL}/api/payments/wompi/nequi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerInfo,
        cart,
        total,
        shippingCost,
        shippingAddress
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error procesando pago')
    }

    return data
  } catch (error) {
    console.error('Error en pago Nequi:', error)
    throw error
  }
}

/**
 * Crear pago con Wompi Tarjeta
 */
export async function createWompiCardPayment(paymentData) {
  const { customerInfo, cart, total, shippingCost, shippingAddress } = paymentData

  try {
    const response = await fetch(`${API_URL}/api/payments/wompi/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerInfo,
        cart,
        total,
        shippingCost,
        shippingAddress
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error procesando pago')
    }

    return data
  } catch (error) {
    console.error('Error en pago con tarjeta:', error)
    throw error
  }
}

/**
 * Crear pago con Wompi PSE
 */
export async function createWompiPSEPayment(paymentData) {
  const { customerInfo, cart, total, shippingCost, shippingAddress, pseInfo } = paymentData

  try {
    const response = await fetch(`${API_URL}/api/payments/wompi/pse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerInfo,
        cart,
        total,
        shippingCost,
        shippingAddress,
        pseInfo
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error procesando pago PSE')
    }

    return data
  } catch (error) {
    console.error('Error en pago PSE:', error)
    throw error
  }
}

/**
 * Obtener bancos PSE
 */
export async function getPSEBanks() {
  try {
    const response = await fetch(`${API_URL}/api/payments/wompi/pse-banks`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo bancos')
    }

    return data.banks
  } catch (error) {
    console.error('Error obteniendo bancos PSE:', error)
    return []
  }
}

/**
 * Crear preferencia de pago con MercadoPago
 */
export async function createMercadoPagoPayment(paymentData) {
  const { customerInfo, cart, total, shippingCost, shippingAddress } = paymentData

  try {
    const response = await fetch(`${API_URL}/api/payments/mercadopago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerInfo,
        cart,
        total,
        shippingCost,
        shippingAddress
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error creando preferencia de pago')
    }

    return data
  } catch (error) {
    console.error('Error en MercadoPago:', error)
    throw error
  }
}

/**
 * Verificar estado de transacción
 */
export async function getTransactionStatus(transactionId) {
  try {
    const response = await fetch(`${API_URL}/api/payments/status/${transactionId}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error verificando estado')
    }

    return data.status
  } catch (error) {
    console.error('Error verificando estado:', error)
    throw error
  }
}

/**
 * Obtener orden por referencia
 */
export async function getOrder(reference) {
  try {
    const response = await fetch(`${API_URL}/api/orders/${reference}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo orden')
    }

    return data.order
  } catch (error) {
    console.error('Error obteniendo orden:', error)
    throw error
  }
}
```

---

## 🔄 Paso 3: Actualizar el Componente de Checkout

### 3.1 Importar servicio API

```javascript
// src/App.jsx

import * as api from './services/api'
```

### 3.2 Reemplazar lógica de pago actual

#### ANTES (placeholder):
```javascript
{checkoutStep === 'payment' && (
  <div style={{ padding: '30px' }}>
    <h3>Método de Pago</h3>
    {/* ... selección de método ... */}
    <button onClick={() => setCheckoutStep('confirmation')}>
      Confirmar Pago
    </button>
  </div>
)}
```

#### DESPUÉS (con API real):
```javascript
const [isProcessingPayment, setIsProcessingPayment] = useState(false)
const [paymentError, setPaymentError] = useState(null)

const handlePayment = async () => {
  if (!selectedPaymentMethod) {
    alert('Por favor selecciona un método de pago')
    return
  }

  setIsProcessingPayment(true)
  setPaymentError(null)

  const shippingCost = colombianCities.find(c => c.name === customerInfo.city)?.shippingCost || 0

  const paymentData = {
    customerInfo,
    cart,
    total: cartTotal,
    shippingCost,
    shippingAddress: {
      address: customerInfo.address,
      city: customerInfo.city,
      state: 'Cundinamarca', // Puedes hacer esto dinámico
      postalCode: '110111' // Agregar campo para código postal
    }
  }

  try {
    let result

    if (selectedPaymentMethod === 'wompi-nequi') {
      result = await api.createWompiNequiPayment(paymentData)

      // Redirigir a URL de pago
      if (result.payment.paymentLinkUrl) {
        window.location.href = result.payment.paymentLinkUrl
      }
    }
    else if (selectedPaymentMethod === 'wompi-card') {
      result = await api.createWompiCardPayment(paymentData)

      if (result.payment.paymentLinkUrl) {
        window.location.href = result.payment.paymentLinkUrl
      }
    }
    else if (selectedPaymentMethod === 'wompi-pse') {
      // Para PSE necesitas primero obtener el banco seleccionado
      const pseInfo = {
        userType: '0', // 0: Persona, 1: Empresa
        documentType: 'CC', // CC, CE, NIT
        documentNumber: customerInfo.documentNumber, // Agregar este campo
        bankCode: selectedBank // Agregar selector de banco
      }

      result = await api.createWompiPSEPayment({
        ...paymentData,
        pseInfo
      })

      if (result.payment.asyncPaymentUrl) {
        window.location.href = result.payment.asyncPaymentUrl
      }
    }
    else if (selectedPaymentMethod === 'mercadopago') {
      result = await api.createMercadoPagoPayment(paymentData)

      if (result.preference.initPoint) {
        window.location.href = result.preference.initPoint
      }
    }

  } catch (error) {
    setPaymentError(error.message)
    console.error('Error procesando pago:', error)
  } finally {
    setIsProcessingPayment(false)
  }
}

// En el JSX:
{checkoutStep === 'payment' && (
  <div style={{ padding: '30px' }}>
    <h3>Método de Pago</h3>

    {/* Mostrar error si existe */}
    {paymentError && (
      <div style={{
        background: '#fee',
        border: '1px solid #fcc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        color: '#c00'
      }}>
        ❌ {paymentError}
      </div>
    )}

    {/* ... métodos de pago ... */}

    <button
      onClick={handlePayment}
      disabled={isProcessingPayment}
      style={{
        width: '100%',
        padding: '15px',
        background: isProcessingPayment ? '#ccc' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: isProcessingPayment ? 'not-allowed' : 'pointer'
      }}
    >
      {isProcessingPayment ? 'Procesando...' : 'Confirmar Pago'}
    </button>
  </div>
)}
```

---

## 📄 Paso 4: Crear Páginas de Resultado

### 4.1 Crear src/pages/PaymentSuccess.jsx

```javascript
// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as api from '../services/api'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const reference = searchParams.get('reference')

  useEffect(() => {
    if (reference) {
      api.getOrder(reference)
        .then(setOrder)
        .catch(console.error)
    }
  }, [reference])

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
      <h1>¡Pago Exitoso!</h1>
      <p>Gracias por tu compra. Hemos recibido tu pago correctamente.</p>

      {order && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '30px',
          maxWidth: '500px',
          margin: '30px auto'
        }}>
          <h3>Detalles de tu orden</h3>
          <p>Referencia: <strong>{order.reference}</strong></p>
          <p>Total: <strong>${order.total.toLocaleString('es-CO')}</strong></p>
          <p>Estado: <strong>{order.status}</strong></p>
        </div>
      )}

      <button
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Volver a la tienda
      </button>
    </div>
  )
}

export default PaymentSuccess
```

### 4.2 Crear src/pages/PaymentFailure.jsx

```javascript
// src/pages/PaymentFailure.jsx

function PaymentFailure() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
      <h1>Pago Rechazado</h1>
      <p>Lo sentimos, no pudimos procesar tu pago.</p>
      <p>Por favor intenta nuevamente o usa otro método de pago.</p>

      <button
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '30px',
          padding: '15px 40px',
          background: '#999',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Reintentar
      </button>
    </div>
  )
}

export default PaymentFailure
```

---

## 🧪 Paso 5: Probar Localmente

### 5.1 Iniciar backend

```bash
cd backend
npm run dev

# Debería mostrar:
# 🚀 dtorreshaus Backend API
# 📡 Servidor: http://localhost:3001
```

### 5.2 Iniciar frontend

```bash
# En otra terminal
cd .. # Volver a raíz
npm run dev

# Debería mostrar:
# VITE ready in xxx ms
# ➜ Local: http://localhost:5173/
```

### 5.3 Probar flujo completo

1. Agregar productos al carrito
2. Ir a checkout
3. Llenar información de cliente
4. Seleccionar método de pago
5. Hacer clic en "Confirmar Pago"
6. Deberías ser redirigido a la pasarela de pago (Wompi/MercadoPago)

---

## 🔍 Debugging

### Ver requests en Network Tab

1. Abrir DevTools (F12)
2. Ir a tab "Network"
3. Hacer el pago
4. Ver request a `/api/payments/...`
5. Revisar Response para ver errores

### Ver logs del backend

```bash
# Terminal del backend mostrará:
[2024-11-08T...] POST /api/payments/wompi/nequi
✅ Pago Nequi creado: DTH-xxxxx
```

---

## 🚀 Deploy a Producción

### Frontend (Vercel/Netlify)

```bash
# Agregar variable de entorno en Vercel/Netlify dashboard
VITE_API_URL=https://api.tudominio.com
```

### Backend (EC2)

Ver guía completa en `backend/DEPLOYMENT.md`

---

## ✅ Checklist

- [ ] Backend corriendo en `http://localhost:3001`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] `.env.local` configurado con API_URL
- [ ] Archivo `src/services/api.js` creado
- [ ] Checkout actualizado para usar API real
- [ ] Páginas PaymentSuccess y PaymentFailure creadas
- [ ] Probado flujo completo de pago
- [ ] Webhooks configurados (en producción)

---

**¡Listo! Tu frontend está conectado con el backend** 🎉
