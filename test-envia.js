/**
 * Script de prueba para verificar API key de Envia.com
 */

const axios = require('axios')
require('dotenv').config({ path: './backend/.env' })

const ENVIA_API_URL = 'https://queries.envia.com/v1'
const ENVIA_API_KEY = process.env.ENVIA_API_KEY

console.log('🔍 Verificando configuración de Envia.com...\n')

// Verificar que la API key esté configurada
if (!ENVIA_API_KEY || ENVIA_API_KEY === 'tu_api_key_de_envia_aqui') {
  console.error('❌ ENVIA_API_KEY no está configurada o tiene el valor por defecto')
  console.error('📝 Edita backend/.env y agrega tu API key de Envia.com')
  process.exit(1)
}

console.log('✅ ENVIA_API_KEY está configurada')
console.log(`📝 API Key: ${ENVIA_API_KEY.substring(0, 10)}...${ENVIA_API_KEY.slice(-4)}`)
console.log(`🌐 API URL: ${ENVIA_API_URL}\n`)

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ENVIA_API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://ship.envia.com',
  'Referer': 'https://ship.envia.com/',
  'Cache-Control': 'no-cache'
}

console.log('📤 Haciendo petición de prueba a Envia.com...\n')

// Hacer una petición simple de cotización
const testData = {
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
    name: 'Cliente Test',
    email: 'cliente@test.com',
    phone: '3009876543',
    street: 'Carrera 7',
    number: '100-25',
    district: 'Centro',
    city: 'Medellín',
    state: 'Antioquia',
    country: 'CO',
    postalCode: '050001'
  },
  packages: [
    {
      content: 'Prueba',
      amount: 1,
      type: 'box',
      weight: 1,
      insurance: 0,
      declaredValue: 50000,
      weightUnit: 'KG',
      lengthUnit: 'CM',
      dimensions: {
        length: 20,
        width: 20,
        height: 20
      }
    }
  ],
  shipment: {
    carrier: 'all'
  }
}

axios.post(
  `${ENVIA_API_URL}/ship/rate`,
  testData,
  { headers }
)
.then(response => {
  console.log('✅ ¡Conexión exitosa con Envia.com!\n')
  console.log('📦 Respuesta de la API:')
  console.log(JSON.stringify(response.data, null, 2))
  console.log('\n✅ La API key funciona correctamente')
  process.exit(0)
})
.catch(error => {
  console.error('❌ Error al conectar con Envia.com\n')

  if (error.response) {
    console.error(`📝 Status Code: ${error.response.status}`)
    console.error(`📝 Status Text: ${error.response.statusText}`)

    if (error.response.status === 403) {
      console.error('\n⚠️  Error 403: Cloudflare bloqueó la petición')
      console.error('\n📝 Posibles causas:')
      console.error('   1. API key incorrecta o expirada')
      console.error('   2. IP del servidor bloqueada por Envia.com')
      console.error('   3. Cuenta de Envia.com no activa o sin permisos de API')
      console.error('\n💡 Soluciones:')
      console.error('   - Verifica tu API key en https://ship.envia.com/api')
      console.error('   - Contacta a soporte de Envia.com y proporciona:')
      console.error(`     * Tu IP: (verifica con curl ifconfig.me)`)
      console.error(`     * Cloudflare Ray ID del error (si aparece en la respuesta)`)

      // Intentar mostrar el HTML de Cloudflare si está presente
      if (typeof error.response.data === 'string' && error.response.data.includes('Cloudflare')) {
        console.error('\n⚠️  Cloudflare está bloqueando activamente la conexión')
      }
    } else if (error.response.status === 401) {
      console.error('\n⚠️  Error 401: No autorizado')
      console.error('   La API key es inválida o no tiene los permisos necesarios')
    } else {
      console.error('\n📄 Respuesta del servidor:')
      console.error(JSON.stringify(error.response.data, null, 2))
    }
  } else if (error.request) {
    console.error('📝 No se recibió respuesta del servidor')
    console.error('   Verifica tu conexión a internet')
  } else {
    console.error('📝 Error:', error.message)
  }

  process.exit(1)
})
