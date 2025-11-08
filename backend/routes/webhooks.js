/**
 * ====================================
 * RUTAS DE WEBHOOKS
 * ====================================
 * Reciben notificaciones de las pasarelas de pago
 */

const express = require('express')
const router = express.Router()
const wompiService = require('../services/wompi.service')
const mercadopagoService = require('../services/mercadopago.service')
// const emailService = require('../services/email.service')
// const { PrismaClient} = require('@prisma/client')
// const prisma = new PrismaClient()

/**
 * POST /api/webhooks/wompi
 * Webhook de Wompi - Recibe notificaciones de cambios en transacciones
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

    // Procesar evento
    if (event.event === 'transaction.updated') {
      const transaction = event.data.transaction

      console.log(`📊 Transacción actualizada: ${transaction.id} - Status: ${transaction.status}`)

      // Actualizar orden en base de datos
      // const order = await prisma.order.findFirst({
      //   where: { transactionId: transaction.id }
      // })

      // if (order) {
        if (transaction.status === 'APPROVED') {
          console.log(`✅ Pago aprobado: ${transaction.reference}`)

          // await prisma.order.update({
          //   where: { id: order.id },
          //   data: {
          //     status: 'paid',
          //     paidAt: new Date()
          //   }
          // })

          // Enviar email de confirmación
          // await emailService.sendOrderConfirmation({
          //   email: order.customerEmail,
          //   orderReference: order.reference,
          //   total: order.total
          // })

        } else if (transaction.status === 'DECLINED') {
          console.log(`❌ Pago rechazado: ${transaction.reference}`)

          // await prisma.order.update({
          //   where: { id: order.id },
          //   data: { status: 'failed' }
          // })

        } else if (transaction.status === 'ERROR') {
          console.log(`⚠️  Error en pago: ${transaction.reference}`)

          // await prisma.order.update({
          //   where: { id: order.id },
          //   data: { status: 'error' }
          // })
        }
      // }
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
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const notification = req.body

    console.log('📨 Webhook MercadoPago recibido:', notification.type)

    if (notification.type === 'payment') {
      const paymentInfo = await mercadopagoService.processWebhookNotification(notification)

      if (paymentInfo) {
        console.log(`📊 Pago actualizado: ${paymentInfo.paymentId} - Status: ${paymentInfo.status}`)

        // Buscar orden
        // const order = await prisma.order.findFirst({
        //   where: { reference: paymentInfo.externalReference }
        // })

        // if (order) {
          if (paymentInfo.status === 'approved') {
            console.log(`✅ Pago aprobado (MP): ${paymentInfo.externalReference}`)

            // await prisma.order.update({
            //   where: { id: order.id },
            //   data: {
            //     status: 'paid',
            //     paidAt: new Date(),
            //     transactionId: paymentInfo.paymentId
            //   }
            // })

            // Enviar email
            // await emailService.sendOrderConfirmation({
            //   email: order.customerEmail,
            //   orderReference: order.reference,
            //   total: order.total
            // })

          } else if (paymentInfo.status === 'rejected') {
            console.log(`❌ Pago rechazado (MP): ${paymentInfo.externalReference}`)

            // await prisma.order.update({
            //   where: { id: order.id },
            //   data: { status: 'failed' }
            // })
          }
        // }
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
    timestamp: new Date().toISOString()
  })
})

module.exports = router
