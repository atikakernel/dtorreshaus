/**
 * ====================================
 * SERVICIO MERCADO PAGO
 * ====================================
 * Integración con la API de MercadoPago
 * Documentación: https://www.mercadopago.com.co/developers
 */

const mercadopago = require('mercadopago')

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

/**
 * Crear preferencia de pago
 */
async function createPaymentPreference(orderData) {
  const { customerInfo, cart, total, shippingCost, reference, shippingAddress } = orderData

  try {
    const preference = {
      items: cart.map(item => ({
        title: item.nombre,
        description: item.descripcion,
        picture_url: `${process.env.FRONTEND_URL}/assets/products/${item.sku}.jpeg`,
        category_id: item.categoria,
        quantity: item.quantity,
        unit_price: item.precio,
        currency_id: 'COP'
      })),
      payer: {
        name: customerInfo.name,
        surname: '', // MercadoPago requiere nombre y apellido separados
        email: customerInfo.email,
        phone: {
          area_code: '57',
          number: customerInfo.phone.replace(/\D/g, '')
        },
        identification: {
          type: 'CC', // CC, CE, NIT
          number: customerInfo.documentNumber || ''
        },
        address: {
          street_name: shippingAddress.address,
          street_number: '',
          zip_code: shippingAddress.postalCode || '110111'
        }
      },
      shipments: {
        cost: shippingCost,
        mode: 'custom',
        receiver_address: {
          apartment: '',
          street_name: shippingAddress.address,
          city_name: shippingAddress.city,
          state_name: shippingAddress.state || 'Cundinamarca',
          country_name: 'Colombia',
          zip_code: shippingAddress.postalCode || '110111'
        }
      },
      back_urls: {
        success: process.env.PAYMENT_SUCCESS_URL,
        failure: process.env.PAYMENT_FAILURE_URL,
        pending: process.env.PAYMENT_PENDING_URL
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'https://api.dtorreshaus.com'}/api/webhooks/mercadopago`,
      external_reference: reference,
      statement_descriptor: 'dtorreshaus',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12, // Máximo de cuotas
        default_installments: 1
      }
    }

    const response = await mercadopago.preferences.create(preference)

    return {
      success: true,
      preferenceId: response.body.id,
      initPoint: response.body.init_point, // URL de pago
      sandboxInitPoint: response.body.sandbox_init_point, // URL de prueba
      reference: reference
    }
  } catch (error) {
    console.error('Error MercadoPago:', error)
    throw new Error('Error creando preferencia de pago en MercadoPago')
  }
}

/**
 * Obtener información de un pago
 */
async function getPaymentInfo(paymentId) {
  try {
    const payment = await mercadopago.payment.findById(paymentId)

    return {
      id: payment.body.id,
      status: payment.body.status, // approved, rejected, pending, in_process
      status_detail: payment.body.status_detail,
      transaction_amount: payment.body.transaction_amount,
      currency_id: payment.body.currency_id,
      external_reference: payment.body.external_reference,
      payment_method_id: payment.body.payment_method_id,
      payment_type_id: payment.body.payment_type_id,
      payer: payment.body.payer
    }
  } catch (error) {
    console.error('Error obteniendo info de pago:', error)
    throw new Error('No se pudo obtener información del pago')
  }
}

/**
 * Procesar notificación de webhook
 */
async function processWebhookNotification(notificationData) {
  const { type, data } = notificationData

  if (type === 'payment') {
    try {
      const payment = await mercadopago.payment.findById(data.id)

      return {
        paymentId: payment.body.id,
        status: payment.body.status,
        externalReference: payment.body.external_reference,
        transactionAmount: payment.body.transaction_amount,
        paymentMethodId: payment.body.payment_method_id,
        statusDetail: payment.body.status_detail
      }
    } catch (error) {
      console.error('Error procesando webhook MP:', error)
      throw error
    }
  }

  return null
}

/**
 * Reembolsar pago
 */
async function refundPayment(paymentId, amount = null) {
  try {
    const refund = await mercadopago.refund.create({
      payment_id: paymentId,
      amount: amount // null = reembolso total
    })

    return {
      success: true,
      refundId: refund.body.id,
      status: refund.body.status,
      amount: refund.body.amount
    }
  } catch (error) {
    console.error('Error reembolsando:', error)
    throw new Error('No se pudo procesar el reembolso')
  }
}

/**
 * Obtener métodos de pago disponibles
 */
async function getPaymentMethods() {
  try {
    const response = await mercadopago.payment_methods.listAll()

    return response.body.filter(method => method.status === 'active')
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error)
    return []
  }
}

module.exports = {
  createPaymentPreference,
  getPaymentInfo,
  processWebhookNotification,
  refundPayment,
  getPaymentMethods
}
