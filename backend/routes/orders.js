/**
 * ====================================
 * RUTAS DE ÓRDENES
 * ====================================
 */

const express = require('express')
const router = express.Router()
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

/**
 * GET /api/orders
 * Obtener todas las órdenes (para admin)
 */
router.get('/', async (req, res) => {
  try {
    // const orders = await prisma.order.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   take: 100
    // })

    const orders = [
      {
        id: 1,
        reference: 'DTH-1234567890',
        customerName: 'Ejemplo',
        total: 150000,
        status: 'pending',
        createdAt: new Date()
      }
    ]

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error obteniendo órdenes:', error)
    res.status(500).json({
      error: 'Error obteniendo órdenes',
      message: error.message
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

    // const order = await prisma.order.findFirst({
    //   where: { reference }
    // })

    const order = {
      id: 1,
      reference: reference,
      customerName: 'Cliente Ejemplo',
      customerEmail: 'cliente@ejemplo.com',
      total: 150000,
      status: 'pending',
      createdAt: new Date()
    }

    // if (!order) {
    //   return res.status(404).json({ error: 'Orden no encontrada' })
    // }

    res.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Error obteniendo orden:', error)
    res.status(500).json({
      error: 'Error obteniendo orden',
      message: error.message
    })
  }
})

/**
 * GET /api/orders/customer/:email
 * Obtener órdenes de un cliente
 */
router.get('/customer/:email', async (req, res) => {
  try {
    const { email } = req.params

    // const orders = await prisma.order.findMany({
    //   where: { customerEmail: email },
    //   orderBy: { createdAt: 'desc' }
    // })

    const orders = []

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Error obteniendo órdenes del cliente:', error)
    res.status(500).json({
      error: 'Error obteniendo órdenes',
      message: error.message
    })
  }
})

/**
 * PUT /api/orders/:reference/status
 * Actualizar estado de una orden (para admin)
 */
router.put('/:reference/status', async (req, res) => {
  try {
    const { reference } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' })
    }

    // const order = await prisma.order.update({
    //   where: { reference },
    //   data: { status }
    // })

    console.log(`📝 Orden ${reference} actualizada a: ${status}`)

    res.json({
      success: true,
      message: 'Estado actualizado correctamente'
    })
  } catch (error) {
    console.error('Error actualizando orden:', error)
    res.status(500).json({
      error: 'Error actualizando orden',
      message: error.message
    })
  }
})

module.exports = router
