import { useState, useEffect } from 'react'
import { createOrder, createWompiNequiPayment, createWompiCardPayment, createWompiPSEPayment, getPSEBanks } from '../services/api'

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
  const [pseBanks, setPseBanks] = useState([])
  const [pseInfo, setPseInfo] = useState({
    documentType: 'CC',
    documentNumber: '',
    userType: '0',
    bankCode: ''
  })

  const finalTotal = total + shippingCost

  // Cargar bancos PSE al montar el componente
  useEffect(() => {
    const loadPSEBanks = async () => {
      try {
        const result = await getPSEBanks()
        if (result.success && result.banks) {
          setPseBanks(result.banks)
        }
      } catch (err) {
        console.error('Error cargando bancos PSE:', err)
      }
    }
    loadPSEBanks()
  }, [])

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
          city: customerInfo.city,
          region: customerInfo.region || 'Colombia'
        },
        paymentMethod: selectedMethod,
        paymentGateway: 'wompi'
      }

      // Crear orden en la base de datos
      const orderResult = await createOrder(orderData)

      if (!orderResult.success) {
        setError('Error creando la orden: ' + orderResult.error)
        return
      }

      const { order } = orderResult

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
          // Validar información PSE
          if (!pseInfo.documentNumber || !pseInfo.bankCode) {
            setError('Por favor completa la información de PSE')
            setLoading(false)
            return
          }
          result = await createWompiPSEPayment({
            ...paymentData,
            pseInfo
          })
          break
        default:
          throw new Error('Método de pago no válido')
      }

      if (result.success) {
        // Redirigir a la página de pago de Wompi
        // Para PSE usar asyncPaymentUrl, para otros métodos usar paymentLinkUrl
        const redirectUrl = result.payment?.asyncPaymentUrl || result.payment?.paymentLinkUrl
        if (redirectUrl) {
          window.location.href = redirectUrl
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
            marginBottom: '10px',
            cursor: 'pointer',
            background: selectedMethod === 'pse' ? '#f0f9ff' : 'white'
          }}
        >
          <strong>🏦 PSE (Débito Bancario)</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Paga desde tu cuenta bancaria
          </p>
        </div>
      </div>

      {selectedMethod === 'pse' && (
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>Información PSE</h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Tipo de documento
            </label>
            <select
              value={pseInfo.documentType}
              onChange={(e) => setPseInfo({ ...pseInfo, documentType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NIT">NIT</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Número de documento
            </label>
            <input
              type="text"
              value={pseInfo.documentNumber}
              onChange={(e) => setPseInfo({ ...pseInfo, documentNumber: e.target.value })}
              placeholder="Ej: 1234567890"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Tipo de persona
            </label>
            <select
              value={pseInfo.userType}
              onChange={(e) => setPseInfo({ ...pseInfo, userType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="0">Persona Natural</option>
              <option value="1">Persona Jurídica</option>
            </select>
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Banco
            </label>
            <select
              value={pseInfo.bankCode}
              onChange={(e) => setPseInfo({ ...pseInfo, bankCode: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="">Selecciona tu banco</option>
              {pseBanks.map((bank) => (
                <option key={bank.financial_institution_code} value={bank.financial_institution_code}>
                  {bank.financial_institution_name}
                </option>
              ))}
            </select>
          </div>
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
