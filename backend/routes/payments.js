/**
 * ====================================
 * RUTAS DE PAGOS
 * ====================================
 */

const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const wompiService = require('../services/wompi.service')
const mercadopagoService = require('../services/mercadopago.service')
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

/**
 * POST /api/payments/wompi/nequi
 * Crear pago con Nequi (Wompi)
 */
router.post('/wompi/nequi', async (req, res) => {
  try {
    const { customerInfo, cart, total, shippingCost, shippingAddress } = req.body

    // Validaciones
    if (!customerInfo || !cart || !total) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    const reference = `DTH-${Date.now()}-${uuidv4().slice(0, 8)}`
    const finalTotal = total + (shippingCost || 0)

    // Crear pago en Wompi
    const payment = await wompiService.createNequiPayment({
      customerInfo,
      total: finalTotal,
      reference,
      shippingAddress
    })

    // Guardar orden en base de datos
    // await prisma.order.create({
    //   data: {
    //     reference,
    //     customerName: customerInfo.name,
    //     customerEmail: customerInfo.email,
    //     customerPhone: customerInfo.phone,
    //     shippingAddress: JSON.stringify(shippingAddress),
    //     cart: JSON.stringify(cart),
    //     subtotal: total,
    //     shippingCost: shippingCost || 0,
    //     total: finalTotal,
    //     status: 'pending',
    //     paymentMethod: 'nequi',
    //     paymentGateway: 'wompi',
    //     transactionId: payment.transactionId
    //   }
    // })

    console.log(`✅ Pago Nequi creado: ${reference}`)

    res.json({
      success: true,
      payment,
      message: 'Pago creado exitosamente'
    })

  } catch (error) {
    console.error('Error en /payments/wompi/nequi:', error)
    res.status(500).json({
      error: 'Error procesando pago',
      message: error.message
    })
  }
})

/**
 * POST /api/payments/wompi/card
 * Crear pago con tarjeta (Wompi)
 */
router.post('/wompi/card', async (req, res) => {
  try {
    const { customerInfo, cart, total, shippingCost, shippingAddress } = req.body

    if (!customerInfo || !cart || !total) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    const reference = `DTH-${Date.now()}-${uuidv4().slice(0, 8)}`
    const finalTotal = total + (shippingCost || 0)

    const payment = await wompiService.createCardPayment({
      customerInfo,
      total: finalTotal,
      reference,
      shippingAddress
    })

    console.log(`✅ Pago con tarjeta creado: ${reference}`)

    res.json({
      success: true,
      payment,
      message: 'Pago creado exitosamente'
    })

  } catch (error) {
    console.error('Error en /payments/wompi/card:', error)
    res.status(500).json({
      error: 'Error procesando pago',
      message: error.message
    })
  }
})

/**
 * POST /api/payments/wompi/pse
 * Crear pago con PSE (Wompi)
 */
router.post('/wompi/pse', async (req, res) => {
  try {
    const { customerInfo, cart, total, shippingCost, shippingAddress, pseInfo } = req.body

    if (!customerInfo || !cart || !total || !pseInfo) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    const reference = `DTH-${Date.now()}-${uuidv4().slice(0, 8)}`
    const finalTotal = total + (shippingCost || 0)

    const payment = await wompiService.createPSEPayment({
      customerInfo,
      total: finalTotal,
      reference,
      shippingAddress,
      pseInfo
    })

    console.log(`✅ Pago PSE creado: ${reference}`)

    res.json({
      success: true,
      payment,
      message: 'Pago PSE creado exitosamente'
    })

  } catch (error) {
    console.error('Error en /payments/wompi/pse:', error)
    res.status(500).json({
      error: 'Error procesando pago PSE',
      message: error.message
    })
  }
})

/**
 * GET /api/payments/wompi/pse-banks
 * Obtener lista de bancos PSE
 */
router.get('/wompi/pse-banks', async (req, res) => {
  try {
    const banks = await wompiService.getPSEBanks()

    res.json({
      success: true,
      banks
    })
  } catch (error) {
    console.error('Error obteniendo bancos PSE:', error)
    res.status(500).json({
      error: 'Error obteniendo bancos',
      message: error.message
    })
  }
})

/**
 * POST /api/payments/mercadopago
 * Crear preferencia de pago con MercadoPago
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const { customerInfo, cart, total, shippingCost, shippingAddress } = req.body

    if (!customerInfo || !cart || !total) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    const reference = `DTH-${Date.now()}-${uuidv4().slice(0, 8)}`

    const preference = await mercadopagoService.createPaymentPreference({
      customerInfo,
      cart,
      total,
      shippingCost: shippingCost || 0,
      reference,
      shippingAddress
    })

    console.log(`✅ Preferencia MercadoPago creada: ${reference}`)

    res.json({
      success: true,
      preference,
      message: 'Preferencia de pago creada exitosamente'
    })

  } catch (error) {
    console.error('Error en /payments/mercadopago:', error)
    res.status(500).json({
      error: 'Error creando preferencia de pago',
      message: error.message
    })
  }
})

/**
 * GET /api/payments/status/:transactionId
 * Verificar estado de transacción (Wompi)
 */
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params

    const status = await wompiService.getTransactionStatus(transactionId)

    res.json({
      success: true,
      status
    })
  } catch (error) {
    console.error('Error verificando estado:', error)
    res.status(500).json({
      error: 'Error verificando estado del pago',
      message: error.message
    })
  }
})

/**
 * GET /api/payments/mercadopago/methods
 * Obtener métodos de pago disponibles en MercadoPago
 */
router.get('/mercadopago/methods', async (req, res) => {
  try {
    const methods = await mercadopagoService.getPaymentMethods()

    res.json({
      success: true,
      methods
    })
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error)
    res.status(500).json({
      error: 'Error obteniendo métodos de pago',
      message: error.message
    })
  }
})

module.exports = router
