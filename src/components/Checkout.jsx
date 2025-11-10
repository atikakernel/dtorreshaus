import { useState } from 'react'
import { createOrder, createWompiNequiPayment, createWompiCardPayment, createWompiPSEPayment } from '../services/api'

export function Checkout({
  cart,
  total,
  shippingCost,
  customerInfo,
  onClose,
  onSuccess
}) {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const finalTotal = total + shippingCost

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Por favor selecciona un método de pago')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Preparar datos de la orden
      const orderData = {
        customerInfo,
        cart,
        total: finalTotal,
        shippingCost,
        shippingAddress: {
          address: customerInfo.address,
          city: customerInfo.city
        },
        paymentMethod: selectedMethod,
        paymentGateway: selectedMethod === 'transfer' ? 'manual' : 'wompi'
      }

      // Crear orden en la base de datos
      const orderResult = await createOrder(orderData)

      if (!orderResult.success) {
        setError('Error creando la orden: ' + orderResult.error)
        return
      }

      const { order } = orderResult

      // Si es transferencia manual, mostrar instrucciones
      if (selectedMethod === 'transfer') {
        onSuccess({
          success: true,
          payment: {
            id: order.id,
            reference: order.reference,
            status: order.status,
            amount: order.total,
            method: 'transfer',
            instructions: {
              bank: 'Nequi',
              phone: '3043465419',
              name: 'dtorreshaus',
              reference: order.reference
            }
          },
          message: 'Pedido registrado. Por favor realiza la transferencia'
        })
        return
      }

      // Para métodos de Wompi, procesar pago
      const paymentData = {
        ...orderData,
        orderId: order.id,
        orderReference: order.reference
      }

      let result
      switch (selectedMethod) {
        case 'nequi':
          result = await createWompiNequiPayment(paymentData)
          break
        case 'card':
          result = await createWompiCardPayment(paymentData)
          break
        case 'pse':
          result = await createWompiPSEPayment(paymentData)
          break
        default:
          throw new Error('Método de pago no válido')
      }

      if (result.success) {
        // Redirigir a la página de pago de Wompi
        if (result.payment?.paymentLinkUrl) {
          window.location.href = result.payment.paymentLinkUrl
        } else {
          onSuccess({
            ...result,
            orderReference: order.reference
          })
        }
      } else {
        setError('Error al procesar el pago. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('Error en el pago:', err)
      setError(err.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Método de Pago</h2>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        {/* Transferencia/Nequi Manual */}
        <div
          onClick={() => setSelectedMethod('transfer')}
          style={{
            border: selectedMethod === 'transfer' ? '2px solid var(--primary-color)' : '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
            background: selectedMethod === 'transfer' ? '#f0f9ff' : 'white'
          }}
        >
          <strong>💸 Transferencia/Nequi Manual</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Realiza una transferencia o pago por Nequi directamente
          </p>
        </div>

        <div
          onClick={() => setSelectedMethod('nequi')}
          style={{
            border: selectedMethod === 'nequi' ? '2px solid var(--primary-color)' : '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
            background: selectedMethod === 'nequi' ? '#f0f9ff' : 'white'
          }}
        >
          <strong>💜 Nequi (Wompi)</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Paga con tu cuenta Nequi vía Wompi
          </p>
        </div>

        <div
          onClick={() => setSelectedMethod('card')}
          style={{
            border: selectedMethod === 'card' ? '2px solid var(--primary-color)' : '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
            background: selectedMethod === 'card' ? '#f0f9ff' : 'white'
          }}
        >
          <strong>💳 Tarjeta de Crédito/Débito</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Visa, Mastercard, American Express
          </p>
        </div>

        <div
          onClick={() => setSelectedMethod('pse')}
          style={{
            border: selectedMethod === 'pse' ? '2px solid var(--primary-color)' : '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: selectedMethod === 'pse' ? '#f0f9ff' : 'white'
          }}
        >
          <strong>🏦 PSE</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Pago a través de tu banco
          </p>
        </div>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Subtotal:</span>
          <strong>${total.toLocaleString('es-CO')}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Envío:</span>
          <strong>${shippingCost.toLocaleString('es-CO')}</strong>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '2px solid #ddd',
          paddingTop: '10px',
          fontSize: '18px'
        }}>
          <span><strong>Total:</strong></span>
          <strong style={{ color: 'var(--primary-color)' }}>
            ${finalTotal.toLocaleString('es-CO')}
          </strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          style={{
            flex: 2,
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            background: loading || !selectedMethod ? '#ccc' : 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 'bold',
            cursor: loading || !selectedMethod ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Procesando...' : 'Pagar Ahora'}
        </button>
      </div>

      <p style={{
        fontSize: '12px',
        color: '#666',
        marginTop: '15px',
        textAlign: 'center'
      }}>
        🔒 Pago seguro procesado por Wompi
      </p>
    </div>
  )
}
