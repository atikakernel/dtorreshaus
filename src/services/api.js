/**
 * ====================================
 * SERVICIO API - dtorreshaus
 * ====================================
 * Cliente para comunicarse con el backend
 */

// URL base del API - se toma de las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Helper para hacer requests HTTP
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const config = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * ====================================
 * PRODUCTOS
 * ====================================
 */

export async function getProducts() {
  return fetchAPI('/api/products')
}

export async function getProductsByCategory(category) {
  return fetchAPI(`/api/products/category/${category}`)
}

/**
 * ====================================
 * ÓRDENES
 * ====================================
 */

export async function createOrder(orderData) {
  return fetchAPI('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify(orderData)
  })
}

export async function getOrder(reference) {
  return fetchAPI(`/api/orders/${reference}`)
}

export async function getOrderStatus(reference) {
  return getOrder(reference)
}

/**
 * ====================================
 * PAGOS - WOMPI
 * ====================================
 */

export async function createWompiNequiPayment(paymentData) {
  return fetchAPI('/api/payments/wompi/nequi', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
}

export async function createWompiCardPayment(paymentData) {
  return fetchAPI('/api/payments/wompi/card', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
}

export async function createWompiPSEPayment(paymentData) {
  return fetchAPI('/api/payments/wompi/pse', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
}

export async function getPSEBanks() {
  return fetchAPI('/api/payments/wompi/pse-banks')
}

/**
 * ====================================
 * PAGOS - MERCADOPAGO
 * ====================================
 */

export async function createMercadoPagoPayment(paymentData) {
  return fetchAPI('/api/payments/mercadopago', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
}

/**
 * ====================================
 * HEALTH CHECK
 * ====================================
 */

export async function healthCheck() {
  return fetchAPI('/health')
}

/**
 * Helper para validar que el API esté disponible
 */
export async function checkAPIConnection() {
  try {
    const health = await healthCheck()
    return health.status === 'ok'
  } catch (error) {
    console.error('API no disponible:', error)
    return false
  }
}

/**
 * ====================================
 * ENVÍOS - ENVIA.COM
 * ====================================
 */

export async function quoteShipping(destination, packages) {
  return fetchAPI('/api/shipping/quote', {
    method: 'POST',
    body: JSON.stringify({ destination, packages })
  })
}

export async function createShipment(destination, packages, orderId) {
  return fetchAPI('/api/shipping/create', {
    method: 'POST',
    body: JSON.stringify({ destination, packages, orderId })
  })
}

export async function trackShipment(trackingNumber) {
  return fetchAPI(`/api/shipping/track/${trackingNumber}`)
}
