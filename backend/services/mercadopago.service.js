/**
 * ====================================
 * SERVICIO MERCADO PAGO v2.0+
 * ====================================
 * Integración con la API de MercadoPago SDK v2
 * Documentación: https://www.mercadopago.com.co/developers
 */

const { MercadoPagoConfig, Preference, Payment, PaymentMethod } = require('mercadopago')

// Configurar cliente de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'dtorreshaus'
  }
})

const preferenceClient = new Preference(client)
const paymentClient = new Payment(client)
const paymentMethodClient = new PaymentMethod(client)

/**
 * Crear preferencia de pago
 */
async function createPaymentPreference(orderData) {
  const { customerInfo, cart, total, shippingCost, reference, shippingAddress } = orderData

  try {
    const preference = {
      items: cart.map(item => ({
        id: item.sku,
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
        surname: customerInfo.surname || 'N/A',
        email: customerInfo.email,
        phone: {
          area_code: '57',
          number: customerInfo.phone.replace(/\D/g, '')
        },
        identification: {
          type: 'CC', // CC, CE, NIT
          number: customerInfo.documentNumber || '00000000'
        },
        address: {
          street_name: shippingAddress.address || customerInfo.address,
          street_number: '',
          zip_code: shippingAddress.postalCode || '110111'
        }
      },
      shipments: {
        cost: shippingCost,
        mode: 'custom',
        receiver_address: {
          apartment: '',
          street_name: shippingAddress.address || customerInfo.address,
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

    const response = await preferenceClient.create({ body: preference })

    return {
      success: true,
      preferenceId: response.id,
      initPoint: response.init_point, // URL de pago
      sandboxInitPoint: response.sandbox_init_point, // URL de prueba
      reference: reference
    }
  } catch (error) {
    console.error('Error MercadoPago createPreference:', error)
    throw new Error(error.message || 'Error creando preferencia de pago en MercadoPago')
  }
}

/**
 * Obtener información de un pago
 */
async function getPaymentInfo(paymentId) {
  try {
    const payment = await paymentClient.get({ id: paymentId })

    return {
      id: payment.id,
      status: payment.status, // approved, rejected, pending, in_process
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      external_reference: payment.external_reference,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      payer: payment.payer
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
      const payment = await paymentClient.get({ id: data.id })

      return {
        paymentId: payment.id,
        status: payment.status,
        externalReference: payment.external_reference,
        transactionAmount: payment.transaction_amount,
        paymentMethodId: payment.payment_method_id,
        statusDetail: payment.status_detail
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
    // En SDK v2, los reembolsos se manejan a través del cliente de Payment
    const refundData = {
      payment_id: paymentId
    }

    if (amount) {
      refundData.amount = amount
    }

    const refund = await paymentClient.refund({
      id: paymentId,
      body: refundData
    })

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount
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
    const response = await paymentMethodClient.get()

    return response.filter(method => method.status === 'active')
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
