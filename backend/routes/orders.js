/**
 * ====================================
 * RUTAS DE ÓRDENES - dtorreshaus
 * ====================================
 */

const express = require('express')
const router = express.Router()
const ordersService = require('../services/orders.service')
const { authenticateAdmin } = require('../middleware/auth')

/**
 * POST /api/orders/create
 * Crear nueva orden
 */
router.post('/create', async (req, res) => {
  try {
    const result = await ordersService.createOrder(req.body)

    if (result.success) {
      return res.status(201).json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error en POST /api/orders/create:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * GET /api/orders/:reference
 * Obtener orden por referencia
 */
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params
    const result = await ordersService.getOrderByReference(reference)

    if (result.success) {
      return res.json(result)
    } else {
      return res.status(404).json(result)
    }
  } catch (error) {
    console.error('Error en GET /api/orders/:reference:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/orders/:reference/confirm-payment
 * Confirmar pago de una orden (de pending a paid)
 * Requiere autenticación de admin
 */
router.post('/:reference/confirm-payment', authenticateAdmin, async (req, res) => {
  try {
    const { reference } = req.params
    const result = await ordersService.confirmPayment(reference)

    if (result.success) {
      return res.json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error en POST /api/orders/:reference/confirm-payment:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/orders/:reference/ship
 * Marcar orden como enviada y crear etiqueta en Envia.com
 * Requiere autenticación de admin
 */
router.post('/:reference/ship', authenticateAdmin, async (req, res) => {
  try {
    const { reference } = req.params
    const result = await ordersService.shipOrder(reference)

    if (result.success) {
      return res.json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error en POST /api/orders/:reference/ship:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/orders/:reference/deliver
 * Marcar orden como entregada
 * Requiere autenticación de admin
 */
router.post('/:reference/deliver', authenticateAdmin, async (req, res) => {
  try {
    const { reference } = req.params
    const result = await ordersService.deliverOrder(reference)

    if (result.success) {
      return res.json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error en POST /api/orders/:reference/deliver:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * GET /api/orders
 * Listar todas las órdenes (para admin)
 * Requiere autenticación de admin
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, limit, offset } = req.query
    const result = await ordersService.listOrders({
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    })

    if (result.success) {
      return res.json(result)
    } else {
      return res.status(400).json(result)
    }
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

module.exports = router
