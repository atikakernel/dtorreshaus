import { useState, useEffect } from 'react'
import { Package, CheckCircle, Truck, X, RefreshCw, Eye, DollarSign, Send } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AdminPanel() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // Verificar si ya está autenticado al cargar
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Verificar que el token sea válido
      verifyToken(token)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [filter, isAuthenticated])

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('admin_token')
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      localStorage.removeItem('admin_token')
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('admin_token', result.token)
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setLoginError(result.error || 'Contraseña incorrecta')
      }
    } catch (error) {
      console.error('Error en login:', error)
      setLoginError('Error al iniciar sesión')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setOrders([])
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await fetch(`${API_URL}/api/orders${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()

      if (result.success) {
        setOrders(result.orders || [])
      } else if (response.status === 401) {
        // Token inválido, cerrar sesión
        handleLogout()
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error)
      alert('Error cargando órdenes')
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (reference) => {
    if (!confirm(`¿Confirmar pago de orden ${reference}?`)) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/orders/${reference}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()

      if (result.success) {
        alert('✅ Pago confirmado. Se envió email al cliente.')
        loadOrders()
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error confirmando pago:', error)
      alert('Error confirmando pago')
    } finally {
      setActionLoading(false)
    }
  }

  const shipOrder = async (reference) => {
    if (!confirm(`¿Marcar orden ${reference} como enviada? Se creará etiqueta en Envia.com`)) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/orders/${reference}/ship`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()

      if (result.success) {
        alert('✅ Orden enviada. Se creó etiqueta y se envió email con tracking.')
        loadOrders()
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error enviando orden:', error)
      alert('Error enviando orden')
    } finally {
      setActionLoading(false)
    }
  }

  const deliverOrder = async (reference) => {
    if (!confirm(`¿Marcar orden ${reference} como entregada?`)) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/orders/${reference}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()

      if (result.success) {
        alert('✅ Orden entregada. Se envió email de confirmación.')
        loadOrders()
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error marcando como entregada:', error)
      alert('Error marcando como entregada')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
      paid: { bg: '#d1fae5', color: '#065f46', label: 'Pagado' },
      shipped: { bg: '#dbeafe', color: '#1e40af', label: 'Enviado' },
      delivered: { bg: '#d1fae5', color: '#065f46', label: 'Entregado' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {style.label}
      </span>
    )
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status)).reduce((sum, o) => sum + o.total, 0)
  }

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, marginBottom: '10px', fontSize: '32px' }}>🏠</h1>
            <h2 style={{ margin: 0, marginBottom: '5px', color: '#1e293b' }}>dtorreshaus</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Panel de Administración</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={loggingIn}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn || !password}
              style={{
                width: '100%',
                padding: '14px',
                background: loggingIn || !password ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loggingIn || !password ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !loggingIn && password && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loggingIn ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            Acceso restringido solo para administradores
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%)', padding: '30px', borderRadius: '15px', marginBottom: '20px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, marginBottom: '10px' }}>🏠 Panel Admin - dtorreshaus</h1>
              <p style={{ margin: 0, opacity: 0.9 }}>Gestión de Órdenes</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Órdenes</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{stats.total}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Pendientes</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Por Enviar</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.paid}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Revenue</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>{formatPrice(stats.revenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Filtrar:</span>
            {['all', 'pending', 'paid', 'shipped', 'delivered'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '8px 16px',
                  border: filter === status ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: filter === status ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: filter === status ? '600' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            <button
              onClick={loadOrders}
              disabled={loading}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                background: '#6366f1',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Recargar
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px' }}>
            <p>Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px' }}>
            <Package size={64} color="#ccc" style={{ marginBottom: '20px' }} />
            <p style={{ color: '#666' }}>No hay órdenes</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Orden</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Cliente</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Total</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
                  <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{order.reference}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{order.paymentMethod}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px' }}>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#ec4899' }}>
                      {formatPrice(order.total)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => confirmPayment(order.reference)}
                            disabled={actionLoading}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              background: '#10b981',
                              color: 'white',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Confirmar Pago"
                          >
                            <DollarSign size={14} />
                            Pagar
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button
                            onClick={() => shipOrder(order.reference)}
                            disabled={actionLoading}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              background: '#6366f1',
                              color: 'white',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Enviar"
                          >
                            <Send size={14} />
                            Enviar
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => deliverOrder(order.reference)}
                            disabled={actionLoading}
                            style={{
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              background: '#10b981',
                              color: 'white',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Entregar"
                          >
                            <CheckCircle size={14} />
                            Entregar
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Ver Detalles"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Orden #{selectedOrder.reference}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Cliente</h4>
                <p><strong>Nombre:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
                <p><strong>Dirección:</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Productos</h4>
                {selectedOrder.cart.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <div>{item.nombre}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>x{item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '600' }}>{formatPrice(item.precio * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Subtotal:</span>
                  <strong>{formatPrice(selectedOrder.subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Envío:</span>
                  <strong>{formatPrice(selectedOrder.shippingCost)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '10px', fontSize: '18px' }}>
                  <span><strong>Total:</strong></span>
                  <strong style={{ color: '#ec4899' }}>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>

              {selectedOrder.shippingTrackingNumber && (
                <div style={{ marginTop: '20px', background: '#eff6ff', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0 }}>Tracking</h4>
                  <p><strong>Número:</strong> {selectedOrder.shippingTrackingNumber}</p>
                  {selectedOrder.shippingCarrier && <p><strong>Transportadora:</strong> {selectedOrder.shippingCarrier}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
