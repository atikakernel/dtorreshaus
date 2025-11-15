/**
 * ====================================
 * RUTAS DE WEBHOOKS - dtorreshaus
 * ====================================
 * Reciben notificaciones de las pasarelas de pago
 * y automáticamente confirman pagos de órdenes
 */

const express = require('express')
const router = express.Router()
const wompiService = require('../services/wompi.service')
const mercadopagoService = require('../services/mercadopago.service')
const ordersService = require('../services/orders.service')
const { PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * POST /api/webhooks/wompi
 * Webhook de Wompi - Recibe notificaciones de cambios en transacciones
 * Confirma pagos automáticamente
 */
router.post('/wompi', async (req, res) => {
  try {
    const event = req.body
    const signature = req.headers['x-event-signature']

    console.log('📨 Webhook Wompi recibido:', event.event)

    // Verificar firma del webhook
    const isValid = wompiService.verifyWebhookSignature(event, signature)

    if (!isValid) {
      console.error('❌ Firma de webhook inválida')
      return res.status(401).json({ error: 'Firma inválida' })
    }

    // Procesar evento de transacción actualizada
    if (event.event === 'transaction.updated') {
      const transaction = event.data.transaction

      console.log(`📊 Transacción actualizada: ${transaction.id} - Status: ${transaction.status}`)

      // Buscar orden por transaction ID
      const order = await prisma.order.findFirst({
        where: { transactionId: transaction.id }
      })

      if (order) {
        if (transaction.status === 'APPROVED') {
          console.log(`✅ Pago aprobado automáticamente: ${order.reference}`)

          // Confirmar pago automáticamente usando el servicio
          await ordersService.confirmPayment(order.reference)

          console.log(`✉️ Email de confirmación enviado a ${order.customerEmail}`)

        } else if (transaction.status === 'DECLINED') {
          console.log(`❌ Pago rechazado: ${order.reference}`)

          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'failed' }
          })

        } else if (transaction.status === 'ERROR') {
          console.log(`⚠️  Error en pago: ${order.reference}`)

          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'error' }
          })
        }
      } else {
        console.log(`⚠️ No se encontró orden para transaction ID: ${transaction.id}`)
      }
    }

    res.sendStatus(200)

  } catch (error) {
    console.error('Error en webhook Wompi:', error)
    res.sendStatus(500)
  }
})

/**
 * POST /api/webhooks/mercadopago
 * Webhook de MercadoPago - Recibe notificaciones de pagos
 * Confirma pagos automáticamente
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const notification = req.body

    console.log('📨 Webhook MercadoPago recibido:', notification.type)

    if (notification.type === 'payment') {
      const paymentInfo = await mercadopagoService.processWebhookNotification(notification)

      if (paymentInfo) {
        console.log(`📊 Pago actualizado: ${paymentInfo.paymentId} - Status: ${paymentInfo.status}`)

        // Buscar orden por referencia externa
        const order = await prisma.order.findFirst({
          where: { reference: paymentInfo.externalReference }
        })

        if (order) {
          if (paymentInfo.status === 'approved') {
            console.log(`✅ Pago aprobado automáticamente (MP): ${order.reference}`)

            // Actualizar transaction ID
            await prisma.order.update({
              where: { id: order.id },
              data: { transactionId: paymentInfo.paymentId }
            })

            // Confirmar pago automáticamente
            await ordersService.confirmPayment(order.reference)

            console.log(`✉️ Email de confirmación enviado a ${order.customerEmail}`)

          } else if (paymentInfo.status === 'rejected') {
            console.log(`❌ Pago rechazado (MP): ${order.reference}`)

            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'failed' }
            })
          }
        } else {
          console.log(`⚠️ No se encontró orden para referencia: ${paymentInfo.externalReference}`)
        }
      }
    }

    res.sendStatus(200)

  } catch (error) {
    console.error('Error en webhook MercadoPago:', error)
    res.sendStatus(500)
  }
})

/**
 * GET /api/webhooks/test
 * Endpoint de prueba para webhooks
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'Webhooks funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      wompi: '/api/webhooks/wompi',
      mercadopago: '/api/webhooks/mercadopago'
    }
  })
})

module.exports = router
