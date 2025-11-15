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
 * POST /api/webhooks/envia
 * Webhook de Envia.com - Recibe notificaciones de cambios en el estado de envíos
 * Actualiza el estado de la orden automáticamente
 */
router.post('/envia', async (req, res) => {
  try {
    const event = req.body

    console.log('📨 Webhook Envia.com recibido:', JSON.stringify(event, null, 2))

    // El webhook de Envia envía estos datos:
    // {
    //   trackingNumber: "123456789",
    //   status: "in_transit" | "out_for_delivery" | "delivered" | "failed_attempt" | "returned",
    //   carrier: "fedex",
    //   statusDate: "2024-01-15T10:30:00Z",
    //   location: "Bogotá, Colombia",
    //   details: "El paquete está en tránsito"
    // }

    const { trackingNumber, status, carrier, statusDate, location, details } = event

    if (!trackingNumber) {
      console.error('❌ Webhook Envia sin trackingNumber')
      return res.status(400).json({ error: 'trackingNumber requerido' })
    }

    // Buscar orden por tracking number
    const order = await prisma.order.findFirst({
      where: { shippingTrackingNumber: trackingNumber }
    })

    if (!order) {
      console.log(`⚠️ No se encontró orden para tracking: ${trackingNumber}`)
      return res.status(404).json({ error: 'Orden no encontrada' })
    }

    console.log(`📦 Orden encontrada: ${order.reference} - Nuevo estado: ${status}`)

    // Actualizar datos de envío en la orden
    const updatedShippingData = {
      ...(typeof order.shippingData === 'object' ? order.shippingData : {}),
      lastStatus: status,
      lastUpdate: statusDate || new Date().toISOString(),
      location: location,
      details: details,
      history: [
        ...((order.shippingData?.history) || []),
        {
          status,
          date: statusDate || new Date().toISOString(),
          location,
          details
        }
      ]
    }

    // Mapear estados de Envia a estados de orden
    let newOrderStatus = order.status
    let deliveredAt = order.deliveredAt

    switch (status) {
      case 'in_transit':
      case 'out_for_delivery':
        // Mantener como "shipped" si ya está enviado
        newOrderStatus = 'shipped'
        break

      case 'delivered':
        // Marcar como entregado
        newOrderStatus = 'delivered'
        deliveredAt = new Date()
        console.log(`✅ Paquete entregado: ${order.reference}`)
        break

      case 'failed_attempt':
      case 'exception':
        // Mantener en shipped pero notificar
        console.log(`⚠️ Intento fallido de entrega: ${order.reference}`)
        break

      case 'returned':
      case 'returned_to_sender':
        // Podríamos crear un estado especial o dejarlo en shipped
        console.log(`🔙 Paquete devuelto al remitente: ${order.reference}`)
        break
    }

    // Actualizar orden en la base de datos
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newOrderStatus,
        shippingData: updatedShippingData,
        deliveredAt: deliveredAt
      }
    })

    // Enviar emails según el estado
    const emailService = require('../services/email.service')

    if (status === 'delivered') {
      // Email de entrega
      await emailService.sendOrderDelivered(updatedOrder)
      console.log(`✉️ Email de entrega enviado a ${order.customerEmail}`)
    } else if (status === 'in_transit') {
      // Email opcional de "en tránsito" (puedes crear esta función si quieres)
      // await emailService.sendOrderInTransit(updatedOrder)
      console.log(`📧 Paquete en tránsito, no se envía email`)
    } else if (status === 'out_for_delivery') {
      // Email opcional de "en reparto" (puedes crear esta función si quieres)
      console.log(`📧 Paquete en reparto, no se envía email`)
    } else if (status === 'failed_attempt') {
      // Email de intento fallido (opcional)
      console.log(`⚠️ Intento fallido, considerar notificar al cliente`)
    }

    res.json({
      success: true,
      message: 'Webhook procesado correctamente',
      order: {
        reference: updatedOrder.reference,
        status: updatedOrder.status
      }
    })

  } catch (error) {
    console.error('❌ Error en webhook Envia:', error)
    res.status(500).json({
      error: 'Error procesando webhook',
      message: error.message
    })
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
      mercadopago: '/api/webhooks/mercadopago',
      envia: '/api/webhooks/envia'
    }
  })
})

module.exports = router
