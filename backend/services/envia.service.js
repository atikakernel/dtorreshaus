/**
 * ====================================
 * SERVICIO ENVIA.COM
 * ====================================
 * Integración con Envia.com para cálculo de envíos
 * Documentación: https://docs.envia.com
 *
 * IMPORTANTE: Si Cloudflare sigue bloqueando (error 403):
 * 1. Verifica que la API key sea válida en https://ship.envia.com/api
 * 2. Contacta a soporte de Envia.com para verificar que tu IP no esté bloqueada
 * 3. Verifica que tu cuenta esté activa y tenga permisos de API
 */

const axios = require('axios')

const ENVIA_API_URL = 'https://queries.envia.com/v1'
const ENVIA_API_KEY = process.env.ENVIA_API_KEY

// Headers comunes para todas las peticiones a Envia.com
// Cloudflare requiere múltiples headers para no bloquear la petición
const getEnviaHeaders = () => ({
  'Authorization': `Bearer ${ENVIA_API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://ship.envia.com',
  'Referer': 'https://ship.envia.com/',
  'Cache-Control': 'no-cache'
})

/**
 * Cotizar envío usando Envia.com
 * @param {Object} shipmentData - Datos del envío
 * @returns {Promise<Object>} Cotizaciones disponibles
 */
async function quoteShipment(shipmentData) {
  const { destination, packages } = shipmentData

  try {
    const response = await axios.post(
      `${ENVIA_API_URL}/ship/rate`,
      {
        origin: {
          name: 'dtorreshaus',
          company: 'dtorreshaus',
          email: 'envios@dtorreshaus.com',
          phone: '3001234567',
          street: 'Calle 123',
          number: '45-67',
          district: 'Chapinero',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'CO',
          postalCode: '110111'
        },
        destination: {
          name: destination.name,
          email: destination.email || 'cliente@example.com',
          phone: destination.phone,
          street: destination.street,
          number: destination.number || 'SN',
          district: destination.district || '',
          city: destination.city,
          state: destination.state || '',
          country: 'CO',
          postalCode: destination.postalCode || ''
        },
        packages: packages || [
          {
            content: 'Artículos de hogar',
            amount: 1,
            type: 'box',
            weight: 2, // kg
            insurance: 0,
            declaredValue: 100000,
            weightUnit: 'KG',
            lengthUnit: 'CM',
            dimensions: {
              length: 30,
              width: 30,
              height: 30
            }
          }
        ],
        shipment: {
          carrier: 'all' // Cotizar con todas las paqueterías disponibles
        }
      },
      {
        headers: getEnviaHeaders()
      }
    )

    // Procesar respuesta de Envia
    if (response.data && response.data.data) {
      const rates = response.data.data.map(rate => ({
        carrier: rate.carrier,
        service: rate.service,
        price: parseFloat(rate.totalPrice),
        deliveryEstimate: rate.deliveryEstimate,
        currency: 'COP'
      }))

      // Ordenar por precio (más barato primero)
      rates.sort((a, b) => a.price - b.price)

      return {
        success: true,
        rates,
        cheapest: rates[0] || null,
        fastest: rates.reduce((fastest, rate) => {
          if (!fastest || rate.deliveryEstimate < fastest.deliveryEstimate) {
            return rate
          }
          return fastest
        }, null)
      }
    }

    return {
      success: false,
      error: 'No se pudieron obtener cotizaciones'
    }

  } catch (error) {
    console.error('Error al cotizar con Envia:', error.response?.data || error.message)

    // Fallback: devolver tarifa fija por ciudad
    const fallbackRates = getFallbackRates(destination.city)

    return {
      success: true,
      usingFallback: true,
      rates: [fallbackRates],
      cheapest: fallbackRates,
      fastest: fallbackRates,
      error: 'Usando tarifas de respaldo'
    }
  }
}

/**
 * Crear envío (cuando el pago sea exitoso)
 */
async function createShipment(shipmentData) {
  const { destination, packages, orderId } = shipmentData

  try {
    const response = await axios.post(
      `${ENVIA_API_URL}/ship/generate`,
      {
        origin: {
          name: 'dtorreshaus',
          company: 'dtorreshaus',
          email: 'envios@dtorreshaus.com',
          phone: '3001234567',
          street: 'Calle 123',
          number: '45-67',
          district: 'Chapinero',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'CO',
          postalCode: '110111',
          reference: ''
        },
        destination: {
          name: destination.name,
          email: destination.email,
          phone: destination.phone,
          street: destination.street,
          number: destination.number || 'SN',
          district: destination.district || '',
          city: destination.city,
          state: destination.state || '',
          country: 'CO',
          postalCode: destination.postalCode || '',
          reference: destination.reference || ''
        },
        packages: packages,
        shipment: {
          carrier: destination.selectedCarrier || 'fedex',
          service: destination.selectedService || 'express',
          type: 1 // 1 = envío normal
        },
        settings: {
          printFormat: 'PDF',
          printSize: 'STOCK_4X6',
          comments: `Orden: ${orderId}`
        }
      },
      {
        headers: getEnviaHeaders()
      }
    )

    if (response.data && response.data.data) {
      return {
        success: true,
        trackingNumber: response.data.data.trackingNumber,
        label: response.data.data.label,
        carrier: response.data.data.carrier,
        service: response.data.data.service
      }
    }

    return {
      success: false,
      error: 'No se pudo crear el envío'
    }

  } catch (error) {
    console.error('❌ Error creando shipment:', error.response?.data || error.message)

    // Si es error 403, dar más información sobre Cloudflare
    if (error.response?.status === 403) {
      console.error('⚠️  Error 403: Cloudflare bloqueó la petición.')
      console.error('📝 Posibles causas:')
      console.error('   1. API key incorrecta o expirada')
      console.error('   2. IP del servidor bloqueada por Envia.com')
      console.error('   3. Cuenta de Envia.com no activa')
      console.error('💡 Solución: Verifica tu API key en https://ship.envia.com/api')

      // Verificar si ENVIA_API_KEY está configurada
      if (!ENVIA_API_KEY) {
        console.error('❗ ENVIA_API_KEY no está configurada en las variables de entorno')
      }
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

/**
 * Rastrear envío
 */
async function trackShipment(trackingNumber) {
  try {
    const response = await axios.get(
      `${ENVIA_API_URL}/ship/track/${trackingNumber}`,
      {
        headers: getEnviaHeaders()
      }
    )

    return {
      success: true,
      tracking: response.data.data
    }

  } catch (error) {
    console.error('Error al rastrear envío:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Tarifas de respaldo si Envia falla
 */
function getFallbackRates(city) {
  const cityRates = {
    'Bogotá': 8000,
    'Medellín': 10000,
    'Cali': 12000,
    'Barranquilla': 15000,
    'Cartagena': 15000,
    'Bucaramanga': 12000,
    'Pereira': 11000,
    'Manizales': 11000,
    'Santa Marta': 16000,
    'Cúcuta': 13000,
    'Ibagué': 10000,
    'Pasto': 14000,
    'Villavicencio': 9000,
    'Armenia': 11000,
    'Tunja': 9000
  }

  return {
    carrier: 'dtorreshaus',
    service: 'Envío estándar',
    price: cityRates[city] || 18000,
    deliveryEstimate: '3-5 días',
    currency: 'COP'
  }
}

module.exports = {
  quoteShipment,
  createShipment,
  trackShipment
}
