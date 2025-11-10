/**
 * ====================================
 * RUTAS DE ENVÍOS - Envia.com
 * ====================================
 */

const express = require('express')
const router = express.Router()
const enviaService = require('../services/envia.service')

/**
 * POST /api/shipping/quote
 * Cotizar envío
 */
router.post('/quote', async (req, res) => {
  try {
    const { destination, packages } = req.body

    if (!destination || !destination.city) {
      return res.status(400).json({
        success: false,
        error: 'Falta información de destino'
      })
    }

    const quote = await enviaService.quoteShipment({
      destination,
      packages
    })

    res.json(quote)

  } catch (error) {
    console.error('Error en quote:', error)
    res.status(500).json({
      success: false,
      error: 'Error al cotizar envío'
    })
  }
})

/**
 * POST /api/shipping/create
 * Crear guía de envío (después de pago exitoso)
 */
router.post('/create', async (req, res) => {
  try {
    const { destination, packages, orderId } = req.body

    const shipment = await enviaService.createShipment({
      destination,
      packages,
      orderId
    })

    res.json(shipment)

  } catch (error) {
    console.error('Error en create shipment:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear envío'
    })
  }
})

/**
 * GET /api/shipping/track/:trackingNumber
 * Rastrear envío
 */
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params

    const tracking = await enviaService.trackShipment(trackingNumber)

    res.json(tracking)

  } catch (error) {
    console.error('Error en track:', error)
    res.status(500).json({
      success: false,
      error: 'Error al rastrear envío'
    })
  }
})

module.exports = router
