import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react'

export function PaymentConfirmation({ transactionId, onClose }) {
  const [status, setStatus] = useState('loading') // loading, success, failed, pending
  const [transactionData, setTransactionData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/status/${transactionId}`)
        const data = await response.json()

        if (data.success) {
          setTransactionData(data.status)

          // Mapear estados de Wompi
          switch (data.status.status) {
            case 'APPROVED':
              setStatus('success')
              break
            case 'DECLINED':
            case 'ERROR':
              setStatus('failed')
              break
            case 'PENDING':
              setStatus('pending')
              break
            default:
              setStatus('pending')
          }
        } else {
          setError('No se pudo verificar el estado del pago')
          setStatus('failed')
        }
      } catch (err) {
        console.error('Error verificando pago:', err)
        setError('Error al verificar el estado del pago')
        setStatus('failed')
      }
    }

    if (transactionId) {
      checkPaymentStatus()
    }
  }, [transactionId])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader size={64} style={{ animation: 'spin 1s linear infinite', color: '#666' }} />
      case 'success':
        return <CheckCircle size={64} style={{ color: '#10b981' }} />
      case 'failed':
        return <XCircle size={64} style={{ color: '#ef4444' }} />
      case 'pending':
        return <Clock size={64} style={{ color: '#f59e0b' }} />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Verificando pago...',
          message: 'Por favor espera mientras verificamos tu pago'
        }
      case 'success':
        return {
          title: 'Pago Exitoso',
          message: `Tu pago ha sido procesado correctamente. Referencia: ${transactionData?.reference || transactionId}. Recibirás un correo de confirmación con los detalles de tu pedido.`
        }
      case 'failed':
        return {
          title: 'Pago Rechazado',
          message: error || 'Tu pago no pudo ser procesado. Por favor intenta nuevamente o usa otro método de pago.'
        }
      case 'pending':
        return {
          title: 'Pago Pendiente',
          message: `Tu pago está siendo procesado. Referencia: ${transactionData?.reference || transactionId}. Te notificaremos cuando se confirme.`
        }
      default:
        return {
          title: 'Estado Desconocido',
          message: 'No pudimos determinar el estado de tu pago.'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          {getStatusIcon()}
        </div>

        <h2 style={{
          marginBottom: '16px',
          fontSize: '24px',
          color: status === 'success' ? '#10b981' : status === 'failed' ? '#ef4444' : status === 'pending' ? '#f59e0b' : '#666'
        }}>
          {statusInfo.title}
        </h2>

        <p style={{
          marginBottom: '32px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          {statusInfo.message}
        </p>

        {transactionData && (
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>ID de transacción:</strong> {transactionData.id}
            </div>
            {transactionData.reference && (
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Referencia:</strong> {transactionData.reference}
              </div>
            )}
            <div style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Monto:</strong> ${(transactionData.amount_in_cents / 100).toLocaleString('es-CO')} COP
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Método:</strong> {transactionData.payment_method_type}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: status === 'success' ? '#10b981' : status === 'failed' ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          {status === 'success' ? 'Seguir Comprando' : 'Cerrar'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
