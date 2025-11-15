import { useState } from 'react'
import { createWompiCheckout } from '../services/api'

export default function CheckoutSimple({ cart, total, shippingCost, customerInfo, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const finalTotal = total + shippingCost

  const handlePayment = async () => {
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
          city: customerInfo.city,
          region: customerInfo.region || 'Colombia'
        }
      }

      // Crear checkout de Wompi
      const result = await createWompiCheckout(orderData)

      if (result.success && result.payment?.checkoutUrl) {
        // Redirigir al checkout de Wompi
        window.location.href = result.payment.checkoutUrl
      } else {
        setError('Error al generar el link de pago')
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
      <h2>Resumen del Pedido</h2>

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

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          💳 Serás redirigido a Wompi para completar tu pago de forma segura.
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          Podrás pagar con Nequi, PSE, Tarjeta de Crédito/Débito y más.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            flex: 1,
            padding: '15px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            flex: 2,
            padding: '15px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Procesando...' : '💳 Pagar con Wompi'}
        </button>
      </div>
    </div>
  )
}
