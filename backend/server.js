/**
 * ====================================
 * SERVIDOR PRINCIPAL - dtorreshaus
 * ====================================
 * Backend API para procesamiento de pagos y gestión de órdenes
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

// Importar rutas
const paymentsRouter = require('./routes/payments')
const ordersRouter = require('./routes/orders')
const webhooksRouter = require('./routes/webhooks')
const productsRouter = require('./routes/products')
const shippingRouter = require('./routes/shipping')
const adminRouter = require('./routes/admin')
const recommendationsRouter = require('./routes/recommendations')

// Inicializar Express
const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy - Necesario porque Nginx hace de reverse proxy
app.set('trust proxy', 1)

// ====================================
// MIDDLEWARE DE SEGURIDAD
// ====================================

// Helmet - Headers de seguridad
app.use(helmet())

// CORS - Permitir requests del frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dtorreshaus.com',
  'http://dtorreshaus.com',
  'https://www.dtorreshaus.com',
  'http://www.dtorreshaus.com'
]

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS no permite el acceso desde este origen.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting - Prevenir ataques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
})
app.use('/api/', limiter)

// Rate limiting estricto para pagos
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Solo 10 intentos de pago por 15 min
  message: 'Demasiados intentos de pago, intenta de nuevo más tarde'
})
app.use('/api/payments/', paymentLimiter)

// ====================================
// MIDDLEWARE DE PARSEO
// ====================================

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logger HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// ====================================
// MIDDLEWARE DE LOGGING
// ====================================

// Log todas las requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ====================================
// RUTAS
// ====================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  })
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'dtorreshaus API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      payments: '/api/payments',
      orders: '/api/orders',
      webhooks: '/api/webhooks',
      products: '/api/products',
      shipping: '/api/shipping',
      admin: '/api/admin'
    }
  })
})

// API Routes
app.use('/api/payments', paymentsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/products', productsRouter)
app.use('/api/shipping', shippingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/recommendations', recommendationsRouter)

// ====================================
// MANEJO DE ERRORES
// ====================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  })
})

// Error handler global
app.use((error, req, res, next) => {
  console.error('❌ Error:', error)

  // Errores de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.message
    })
  }

  // Errores de autenticación
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: error.message
    })
  }

  // Error genérico
  res.status(error.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// ====================================
// INICIAR SERVIDOR
// ====================================

const server = app.listen(PORT, () => {
  console.log('====================================')
  console.log('🚀 dtorreshaus Backend API')
  console.log('====================================')
  console.log(`📡 Servidor: http://localhost:${PORT}`)
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`)
  console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`)
  console.log(`⏰ Iniciado: ${new Date().toISOString()}`)
  console.log('====================================')
})

// ====================================
// GRACEFUL SHUTDOWN
// ====================================

process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recibido, cerrando servidor...')

  server.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('❌ Forzando cierre del servidor')
    process.exit(1)
  }, 10000)
})

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT recibido, cerrando servidor...')
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })
})

// Capturar errores no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason)
  // En producción, considera reiniciar el proceso
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

module.exports = app
