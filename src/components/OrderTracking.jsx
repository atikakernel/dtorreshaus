import { useState, useEffect } from 'react'
import { X, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { getOrder } from '../services/api'

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function OrderTracking({ reference, onClose }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrder()
  }, [reference])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const result = await getOrder(reference)

      if (result.success) {
        setOrder(result.order)
      } else {
        setError(result.error || 'Orden no encontrada')
      }
    } catch (err) {
      setError('Error cargando la orden')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { icon: Clock, color: '#f59e0b', label: 'Pendiente de Pago', desc: 'Esperando confirmación de pago' },
      paid: { icon: CheckCircle, color: '#10b981', label: 'Pago Confirmado', desc: 'Preparando tu pedido' },
      shipped: { icon: Truck, color: '#6366f1', label: 'Enviado', desc: 'Tu pedido está en camino' },
      delivered: { icon: Package, color: '#10b981', label: 'Entregado', desc: 'Pedido entregado exitosamente' },
      cancelled: { icon: X, color: '#ef4444', label: 'Cancelado', desc: 'Orden cancelada' }
    }
    return statuses[status] || statuses.pending
  }

  if (loading) {
    return (
      <div className="cart-overlay">
        <div className="cart-modal" style={{ maxWidth: '800px', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cart-overlay" onClick={onClose}>
        <div className="cart-modal" style={{ maxWidth: '600px', padding: '40px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <button className="image-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2>Orden no encontrada</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal" style={{ maxWidth: '900px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div>
            <h2>Pedido #{order.reference}</h2>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Creado: {formatDate(order.createdAt)}</p>
          </div>
          <button className="close-cart" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Status Card */}
          <div style={{
            background: '#f8f9fa',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: `3px solid ${statusInfo.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                background: statusInfo.color,
                borderRadius: '50%',
                padding: '15px',
                display: 'flex'
              }}>
                <StatusIcon size={32} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: statusInfo.color }}>{statusInfo.label}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>{statusInfo.desc}</p>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', position: 'relative' }}>
              {[
                { status: 'pending', label: 'Creado', date: order.createdAt },
                { status: 'paid', label: 'Pagado', date: order.paidAt },
                { status: 'shipped', label: 'Enviado', date: order.shippedAt },
                { status: 'delivered', label: 'Entregado', date: order.deliveredAt }
              ].map((step, index) => {
                const statusValues = ['pending', 'paid', 'shipped', 'delivered']
                const currentIndex = statusValues.indexOf(order.status)
                const stepIndex = statusValues.indexOf(step.status)
                const isActive = stepIndex <= currentIndex

                return (
                  <div key={step.status} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isActive ? statusInfo.color : '#e5e7eb',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}>
                      {isActive ? '✓' : index + 1}
                    </div>
                    <p style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? '#1e293b' : '#94a3b8'
                    }}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
                        {new Date(step.date).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Instructions for Pending Orders */}
          {order.status === 'pending' && order.paymentMethod === 'transfer' && (
            <div style={{
              background: '#fef3c7',
              padding: '20px',
              borderRadius: '10px',
              border: '2px solid #f59e0b',
              marginBottom: '30px'
            }}>
              <h4 style={{ color: '#92400e', marginTop: 0 }}>📱 Instrucciones de Pago</h4>
              <p><strong>Nequi:</strong> 3043465419</p>
              <p><strong>A nombre de:</strong> dtorreshaus</p>
              <p><strong>Referencia:</strong> <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>{order.reference}</code></p>
              <p style={{ marginTop: '15px', fontSize: '14px' }}>
                ⚠️ Por favor envía el comprobante de pago a nuestro WhatsApp para confirmar tu pedido.
              </p>
            </div>
          )}

          {/* Tracking Info */}
          {order.shippingTrackingNumber && (
            <div style={{
              background: '#eff6ff',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '2px solid #6366f1'
            }}>
              <h4 style={{ color: '#1e40af', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} />
                Información de Envío
              </h4>
              <p><strong>Número de Seguimiento:</strong> <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>{order.shippingTrackingNumber}</code></p>
              {order.shippingCarrier && <p><strong>Transportadora:</strong> {order.shippingCarrier}</p>}
              {order.shippingEstimatedDelivery && <p><strong>Entrega Estimada:</strong> {order.shippingEstimatedDelivery}</p>}
            </div>
          )}

          {/* Customer Info */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginTop: 0 }}>Información del Cliente</h4>
            <p><strong>Nombre:</strong> {order.customerName}</p>
            <p><strong>Email:</strong> {order.customerEmail}</p>
            <p><strong>Teléfono:</strong> {order.customerPhone}</p>
            <p><strong>Dirección:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
          </div>

          {/* Products */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginTop: 0 }}>Productos</h4>
            {order.cart.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: index < order.cart.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600' }}>{item.nombre}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Cantidad: {item.quantity} × {formatPrice(item.precio)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--accent-color)' }}>
                    {formatPrice(item.precio * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal:</span>
              <strong>{formatPrice(order.subtotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Envío:</span>
              <strong>{formatPrice(order.shippingCost)}</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #ddd',
              paddingTop: '10px',
              fontSize: '20px'
            }}>
              <span><strong>Total:</strong></span>
              <strong style={{ color: 'var(--accent-color)' }}>{formatPrice(order.total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
