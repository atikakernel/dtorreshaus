/**
 * ====================================
 * SERVICIO WOMPI
 * ====================================
 * Integración con la API de Wompi para procesar pagos
 * Documentación: https://docs.wompi.co/
 */

const axios = require('axios')
const crypto = require('crypto')

const WOMPI_API_URL = 'https://production.wompi.co/v1'
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET

/**
 * Obtener información del merchant (token de aceptación e integrity)
 */
async function getMerchantInfo() {
  try {
    const response = await axios.get(
      `${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`
    )
    return {
      acceptanceToken: response.data.data.presigned_acceptance.acceptance_token,
      integritySecret: response.data.data.presigned_personal_data_auth.integrity_secret
    }
  } catch (error) {
    console.error('Error obteniendo merchant info:', error.response?.data || error.message)
    throw new Error('No se pudo obtener la información del merchant de Wompi')
  }
}

/**
 * Crear transacción con Nequi
 */
async function createNequiPayment(orderData) {
  const { customerInfo, total, reference, shippingAddress } = orderData

  try {
    const merchantInfo = await getMerchantInfo()
    const amountInCents = Math.round(total * 100)

    const transaction = {
      acceptance_token: merchantInfo.acceptanceToken,
      amount_in_cents: amountInCents,
      currency: 'COP',
      customer_email: customerInfo.email,
      payment_method: {
        type: 'NEQUI',
        phone_number: customerInfo.phone
      },
      reference: reference,
      customer_data: {
        phone_number: customerInfo.phone,
        full_name: customerInfo.name
      },
      shipping_address: {
        address_line_1: shippingAddress.address,
        city: shippingAddress.city,
        region: shippingAddress.region || 'Colombia',
        phone_number: customerInfo.phone,
        country: 'CO'
      },
      redirect_url: process.env.PAYMENT_SUCCESS_URL
    }

    const response = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      success: true,
      transactionId: response.data.data.id,
      status: response.data.data.status,
      paymentLinkUrl: response.data.data.payment_link_url,
      reference: reference
    }
  } catch (error) {
    console.error('Error Wompi Nequi:', JSON.stringify(error.response?.data, null, 2) || error.message)
    throw new Error(error.response?.data?.error?.reason || 'Error procesando pago con Nequi')
  }
}

/**
 * Crear transacción con tarjeta de crédito/débito
 */
async function createCardPayment(orderData) {
  const { customerInfo, total, reference, shippingAddress } = orderData

  try {
    const merchantInfo = await getMerchantInfo()
    const amountInCents = Math.round(total * 100)

    const transaction = {
      acceptance_token: merchantInfo.acceptanceToken,
      amount_in_cents: amountInCents,
      currency: 'COP',
      customer_email: customerInfo.email,
      payment_method: {
        type: 'CARD',
        installments: 1
      },
      reference: reference,
      customer_data: {
        phone_number: customerInfo.phone,
        full_name: customerInfo.name
      },
      shipping_address: {
        address_line_1: shippingAddress.address,
        city: shippingAddress.city,
        region: shippingAddress.region || 'Colombia',
        phone_number: customerInfo.phone,
        country: 'CO'
      },
      redirect_url: process.env.PAYMENT_SUCCESS_URL
    }

    const response = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      success: true,
      transactionId: response.data.data.id,
      status: response.data.data.status,
      paymentLinkUrl: response.data.data.payment_link_url,
      reference: reference
    }
  } catch (error) {
    console.error('Error Wompi Card:', JSON.stringify(error.response?.data, null, 2) || error.message)
    throw new Error(error.response?.data?.error?.reason || 'Error procesando pago con tarjeta')
  }
}

/**
 * Crear transacción con PSE
 */
async function createPSEPayment(orderData) {
  const { customerInfo, total, reference, shippingAddress, pseInfo } = orderData

  try {
    const acceptanceToken = await getAcceptanceToken()

    const transaction = {
      acceptance_token: acceptanceToken,
      amount_in_cents: Math.round(total * 100),
      currency: 'COP',
      customer_email: customerInfo.email,
      payment_method: {
        type: 'PSE',
        user_type: pseInfo.userType || '0', // 0: Persona, 1: Empresa
        user_legal_id: pseInfo.documentNumber,
        user_legal_id_type: pseInfo.documentType, // CC, CE, NIT
        financial_institution_code: pseInfo.bankCode,
        payment_description: `Compra en dtorreshaus - ${reference}`
      },
      reference: reference,
      customer_data: {
        phone_number: customerInfo.phone,
        full_name: customerInfo.name,
        legal_id: pseInfo.documentNumber,
        legal_id_type: pseInfo.documentType
      },
      shipping_address: {
        address_line_1: shippingAddress.address,
        city: shippingAddress.city,
        phone_number: customerInfo.phone,
        country: 'CO'
      },
      redirect_url: process.env.PAYMENT_SUCCESS_URL
    }

    const response = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      success: true,
      transactionId: response.data.data.id,
      status: response.data.data.status,
      paymentLinkUrl: response.data.data.payment_link_url,
      asyncPaymentUrl: response.data.data.async_payment_url, // URL del banco
      reference: reference
    }
  } catch (error) {
    console.error('Error Wompi PSE:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error?.reason || 'Error procesando pago con PSE')
  }
}

/**
 * Verificar estado de transacción
 */
async function getTransactionStatus(transactionId) {
  try {
    const response = await axios.get(
      `${WOMPI_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
        }
      }
    )

    return {
      id: response.data.data.id,
      status: response.data.data.status, // APPROVED, DECLINED, PENDING, ERROR
      reference: response.data.data.reference,
      amount_in_cents: response.data.data.amount_in_cents,
      payment_method_type: response.data.data.payment_method_type
    }
  } catch (error) {
    console.error('Error verificando transacción:', error.response?.data || error.message)
    throw new Error('No se pudo verificar el estado de la transacción')
  }
}

/**
 * Verificar firma del webhook
 */
function verifyWebhookSignature(event, signature) {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(event) + WOMPI_EVENTS_SECRET)
    .digest('hex')

  return hash === signature
}

/**
 * Obtener lista de bancos PSE
 */
async function getPSEBanks() {
  try {
    const response = await axios.get(
      `${WOMPI_API_URL}/pse/financial_institutions`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
        }
      }
    )

    return response.data.data
  } catch (error) {
    console.error('Error obteniendo bancos PSE:', error.response?.data || error.message)
    return []
  }
}

module.exports = {
  createNequiPayment,
  createCardPayment,
  createPSEPayment,
  getTransactionStatus,
  verifyWebhookSignature,
  getPSEBanks,
  getMerchantInfo
}
