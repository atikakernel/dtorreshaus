const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const enviaService = require('./envia.service')
const emailService = require('./email.service')

/**
 * Crear nueva orden
 */
async function createOrder(orderData) {
  try {
    const {
      customerInfo,
      cart,
      total,
      shippingCost,
      shippingAddress,
      paymentMethod,
      paymentGateway = 'manual',
      transactionId = null
    } = orderData

    // Generar referencia única: DTH-timestamp-random
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const reference = `DTH-${timestamp}-${random}`

    // Calcular subtotal
    const subtotal = total - shippingCost

    // Crear orden en la base de datos
    const order = await prisma.order.create({
      data: {
        reference,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: {
          address: shippingAddress.address || customerInfo.address,
          city: shippingAddress.city || customerInfo.city
        },
        cart,
        subtotal,
        shippingCost,
        total,
        status: 'pending', // Siempre crear como pending, se actualiza cuando se confirma el pago
        paymentMethod,
        paymentGateway,
        transactionId,
        paidAt: null
      }
    })

    // Solo enviar email de confirmación para transferencias
    // Para pagos con gateway (Wompi, MP), se envía cuando se confirma el pago
    if (paymentMethod === 'transfer') {
      await emailService.sendOrderConfirmation(order)
    }

    console.log('✅ Orden creada:', reference)

    return {
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        total: order.total
      }
    }
  } catch (error) {
    console.error('❌ Error creando orden:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Obtener orden por referencia
 */
async function getOrderByReference(reference) {
  try {
    const order = await prisma.order.findUnique({
      where: { reference }
    })

    if (!order) {
      return {
        success: false,
        error: 'Orden no encontrada'
      }
    }

    // Si tiene tracking, obtener información actualizada de Envia.com
    let trackingInfo = null
    if (order.shippingTrackingNumber) {
      const tracking = await enviaService.trackShipment(order.shippingTrackingNumber)
      if (tracking.success) {
        trackingInfo = tracking.tracking
      }
    }

    return {
      success: true,
      order: {
        ...order,
        trackingInfo
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo orden:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Confirmar pago de una orden (cambiar status de pending a paid)
 */
async function confirmPayment(reference) {
  try {
    const order = await prisma.order.findUnique({
      where: { reference }
    })

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.status !== 'pending') {
      return { success: false, error: `La orden ya está en estado: ${order.status}` }
    }

    // Actualizar orden a paid
    const updatedOrder = await prisma.order.update({
      where: { reference },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    })

    // Enviar email de pago confirmado al cliente
    await emailService.sendPaymentConfirmed(updatedOrder)

    // Enviar notificación al admin de nuevo pedido
    await emailService.sendAdminNewOrderNotification(updatedOrder)

    console.log('✅ Pago confirmado para orden:', reference)

    return {
      success: true,
      order: updatedOrder
    }
  } catch (error) {
    console.error('❌ Error confirmando pago:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Marcar orden como enviada y crear etiqueta en Envia.com
 */
async function shipOrder(reference) {
  try {
    const order = await prisma.order.findUnique({
      where: { reference }
    })

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.status !== 'paid') {
      return { success: false, error: `La orden debe estar en estado "paid". Estado actual: ${order.status}` }
    }

    // Crear shipment en Envia.com
    const destination = {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      ...order.shippingAddress
    }

    // Calcular paquetes basados en el carrito
    const totalWeight = order.cart.reduce((sum, item) => sum + (item.quantity * 0.5), 0) // Estimar 0.5kg por producto
    const packages = [{
      content: order.cart.map(item => item.nombre).join(', '),
      amount: order.cart.reduce((sum, item) => sum + item.quantity, 0),
      type: 'box',
      weight: Math.max(totalWeight, 1), // Mínimo 1kg
      insurance: 0,
      declaredValue: order.subtotal,
      weightUnit: 'KG',
      lengthUnit: 'CM',
      dimensions: {
        length: 30,
        width: 30,
        height: 30
      }
    }]

    const shipmentResult = await enviaService.createShipment({
      destination,
      packages,
      orderId: reference
    })

    if (!shipmentResult.success) {
      console.error('❌ Error creando shipment:', shipmentResult.error)
      // Continuar sin tracking si Envia.com falla
    }

    // Actualizar orden
    const updatedOrder = await prisma.order.update({
      where: { reference },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
        shippingTrackingNumber: shipmentResult.shipment?.trackingNumber || null,
        shippingCarrier: shipmentResult.shipment?.carrier || null,
        shippingLabelUrl: shipmentResult.shipment?.labelUrl || null,
        shippingEstimatedDelivery: shipmentResult.shipment?.estimatedDelivery || null,
        shippingData: shipmentResult.shipment || null
      }
    })

    // Enviar email de envío
    if (shipmentResult.success && shipmentResult.shipment) {
      await emailService.sendOrderShipped(updatedOrder, {
        trackingNumber: shipmentResult.shipment.trackingNumber,
        carrier: shipmentResult.shipment.carrier,
        estimatedDelivery: shipmentResult.shipment.estimatedDelivery
      })
    }

    console.log('✅ Orden marcada como enviada:', reference)

    return {
      success: true,
      order: updatedOrder,
      shipment: shipmentResult.shipment
    }
  } catch (error) {
    console.error('❌ Error enviando orden:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Marcar orden como entregada
 */
async function deliverOrder(reference) {
  try {
    const order = await prisma.order.findUnique({
      where: { reference }
    })

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.status !== 'shipped') {
      return { success: false, error: `La orden debe estar en estado "shipped". Estado actual: ${order.status}` }
    }

    // Actualizar orden
    const updatedOrder = await prisma.order.update({
      where: { reference },
      data: {
        status: 'delivered',
        deliveredAt: new Date()
      }
    })

    // Enviar email de entrega
    await emailService.sendOrderDelivered(updatedOrder)

    console.log('✅ Orden marcada como entregada:', reference)

    return {
      success: true,
      order: updatedOrder
    }
  } catch (error) {
    console.error('❌ Error entregando orden:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Listar todas las órdenes (para admin)
 */
async function listOrders({ status, limit = 50, offset = 0 }) {
  try {
    const where = status ? { status } : {}

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.order.count({ where })

    return {
      success: true,
      orders,
      total,
      limit,
      offset
    }
  } catch (error) {
    console.error('❌ Error listando órdenes:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = {
  createOrder,
  getOrderByReference,
  confirmPayment,
  shipOrder,
  deliverOrder,
  listOrders
}
