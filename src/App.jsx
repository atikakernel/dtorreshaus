import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Home, X, Plus, Minus, Trash2, ChefHat, Droplet, Sparkles, Package, Lightbulb, Zap, Heart, Dumbbell, Search, CreditCard, MapPin, Gift, Target, Truck, AlertCircle } from 'lucide-react'
import { categoryConfig } from './productsData.js'
import { useProducts } from './hooks/useProducts'
import CheckoutSimple from './components/CheckoutSimple'
import { OrderTracking } from './components/OrderTracking'
import { PaymentConfirmation } from './components/PaymentConfirmation'
import { quoteShipping } from './services/api'

// Mapeo de iconos para categorías
const categoryIcons = {
  cocina: ChefHat,
  baño: Droplet,
  limpieza: Sparkles,
  organización: Package,
  decoración: Lightbulb,
  tecnología: Zap,
  bienestar: Heart,
  deportes: Dumbbell,
  labubu: Gift,
  armas: Target
}

// Colombian cities for shipping calculation
const colombianCities = [
  { name: 'Bogotá', region: 'Cundinamarca' },
  { name: 'Medellín', region: 'Antioquia' },
  { name: 'Cali', region: 'Valle del Cauca' },
  { name: 'Barranquilla', region: 'Atlántico' },
  { name: 'Cartagena', region: 'Bolívar' },
  { name: 'Bucaramanga', region: 'Santander' },
  { name: 'Pereira', region: 'Risaralda' },
  { name: 'Manizales', region: 'Caldas' },
  { name: 'Santa Marta', region: 'Magdalena' },
  { name: 'Cúcuta', region: 'Norte de Santander' },
  { name: 'Ibagué', region: 'Tolima' },
  { name: 'Pasto', region: 'Nariño' },
  { name: 'Villavicencio', region: 'Meta' },
  { name: 'Armenia', region: 'Quindío' },
  { name: 'Tunja', region: 'Boyacá' },
  { name: 'Otras ciudades', region: 'Colombia' }
]

// Formato de precio colombiano
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

// Componente para imagen del producto con fallback
const ProductImage = ({ sku, emoji, onClick }) => {
  const [imageError, setImageError] = useState(false)

  const tryLoadImage = () => {
    if (imageError) return null
    const imagePath = `/assets/products/${sku}.jpeg`
    return (
      <img
        src={imagePath}
        alt={sku}
        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
        onError={() => setImageError(true)}
        onClick={onClick}
        title="Click para ver en detalle"
      />
    )
  }

  return (
    <div className="product-image" style={{ background: '#f8f9fa' }}>
      {!imageError ? tryLoadImage() : <div style={{ fontSize: '80px' }}>{emoji}</div>}
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [imageModal, setImageModal] = useState({ isOpen: false, sku: null, nombre: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('info') // 'info', 'payment', 'confirmation'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá',
    region: 'Cundinamarca'
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [trackingReference, setTrackingReference] = useState('')
  const [trackingInput, setTrackingInput] = useState('')
  const [paymentConfirmation, setPaymentConfirmation] = useState({ show: false, transactionId: null })
  const [shippingCost, setShippingCost] = useState(0)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Cargar productos usando el hook
  const { products: productsData, loading: loadingProducts, error: errorProducts, usingFallback } = useProducts()

  // Ref para scroll a productos
  const productsSectionRef = useRef(null)

  // Cargar información guardada del cliente desde localStorage
  useEffect(() => {
    const savedInfo = localStorage.getItem('dtorreshaus_customer_info')
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo)
        setCustomerInfo(parsedInfo)
      } catch (e) {
        console.error('Error al cargar información guardada:', e)
      }
    }
  }, [])

  // Guardar información del cliente en localStorage cuando cambia
  useEffect(() => {
    if (customerInfo.name || customerInfo.email || customerInfo.phone) {
      localStorage.setItem('dtorreshaus_customer_info', JSON.stringify(customerInfo))
    }
  }, [customerInfo])

  // Detectar si el usuario regresa de Wompi con un pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const transactionId = urlParams.get('id') // Wompi redirige con ?id=transaction_id

    if (transactionId) {
      setPaymentConfirmation({ show: true, transactionId })
      // Limpiar la URL sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Detectar si hay un parámetro de tracking en la URL para abrir automáticamente el modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const trackParam = urlParams.get('track')

    // También detectar si la ruta es /order/:reference
    const path = window.location.pathname
    const orderMatch = path.match(/\/order\/([A-Z0-9-]+)/)

    const referenceToTrack = trackParam || (orderMatch ? orderMatch[1] : null)

    if (referenceToTrack) {
      setTrackingInput(referenceToTrack)
      setTrackingReference(referenceToTrack)
      setIsTrackingModalOpen(true)
      // Limpiar la URL sin recargar la página
      window.history.replaceState({}, document.title, '/')
    }
  }, [])

  // Calcular costo de envío dinámicamente cuando cambia la ciudad
  useEffect(() => {
    const calculateShipping = async () => {
      if (!customerInfo.city || cart.length === 0) {
        setShippingCost(0)
        return
      }

      setLoadingShipping(true)
      try {
        // Calcular peso total aproximado del carrito
        const totalWeight = cart.reduce((sum, item) => sum + (item.quantity * 1), 0) // Asumimos 1kg por item

        const result = await quoteShipping(
          {
            name: customerInfo.name || 'Cliente',
            phone: customerInfo.phone || '3000000000',
            city: customerInfo.city,
            state: customerInfo.region || colombianCities.find(c => c.name === customerInfo.city)?.region || 'Colombia'
          },
          [{
            content: 'Artículos de hogar',
            amount: cart.length,
            type: 'box',
            weight: totalWeight,
            insurance: 0,
            declaredValue: cartTotal,
            weightUnit: 'KG',
            lengthUnit: 'CM',
            dimensions: {
              length: 30,
              width: 30,
              height: 30
            }
          }]
        )

        if (result.success && result.cheapest) {
          setShippingCost(result.cheapest.price)
        } else {
          // Fallback a 0 si hay error
          setShippingCost(0)
        }
      } catch (error) {
        console.error('Error calculando envío:', error)
        setShippingCost(0)
      } finally {
        setLoadingShipping(false)
      }
    }

    calculateShipping()
  }, [customerInfo.city, cart])

  // Filtrar productos según categoría activa y búsqueda
  const getFilteredProducts = () => {
    console.log("=== DEBUG getFilteredProducts ===")
    console.log("productsData:", productsData)
    console.log("activeCategory:", activeCategory)

    if (!productsData) return []
    
    let products = []
    if (activeCategory === 'all') {
      // Mostrar productos de categorías configuradas activas
      const activeCategories = Object.keys(categoryConfig)
        .filter(cat => categoryConfig[cat].active)
        .sort((a, b) => categoryConfig[a].order - categoryConfig[b].order)

      console.log("activeCategories:", activeCategories)
      let mappedProducts = activeCategories.flatMap(cat => {
        const catProducts = productsData[cat] || []
        console.log(`Cat: ${cat}, Found items: ${catProducts.length}`)
        return catProducts
      })
      
      // Mostrar también productos de categorías NUEVAS (que no estén en categoryConfig)
      const unconfiguredCats = Object.keys(productsData).filter(pCat => !categoryConfig[pCat])
      if (unconfiguredCats.length > 0) {
        console.log("Found unconfigured categories with products:", unconfiguredCats)
        const newProducts = unconfiguredCats.flatMap(cat => productsData[cat] || [])
        mappedProducts = [...mappedProducts, ...newProducts]
      }

      products = mappedProducts
      console.log("Total mapped products before search:", products?.length)
    } else {
      products = productsData[activeCategory] || []
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      products = products.filter(product =>
        (product.nombre || '').toLowerCase().includes(lowerSearch) ||
        (product.descripcion || '').toLowerCase().includes(lowerSearch) ||
        (product.sku || '').toLowerCase().includes(lowerSearch) ||
        (product.categoria || '').toLowerCase().includes(lowerSearch)
      )
    }

    return products
  }

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.sku === product.sku)
      if (existingItem) {
        return prevCart.map(item =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  // Actualizar cantidad
  const updateQuantity = (sku, change) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.sku === sku
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  // Remover del carrito
  const removeFromCart = (sku) => {
    setCart(prevCart => prevCart.filter(item => item.sku !== sku))
  }

  // Calcular total del carrito
  const cartTotal = cart.reduce((total, item) => total + (item.precio * item.quantity), 0)
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

  // Función para obtener ubicación del usuario
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Usar API de geocoding inverso de OpenStreetMap (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'es'
              }
            }
          )

          const data = await response.json()

          if (data && data.address) {
            const address = data.address

            // Construir dirección completa
            let fullAddress = ''
            if (address.road) fullAddress += address.road
            if (address.house_number) fullAddress += ` #${address.house_number}`
            if (address.neighbourhood) fullAddress += `, ${address.neighbourhood}`

            // Determinar la ciudad más cercana
            const city = address.city || address.town || address.municipality || address.county
            let matchedCity = colombianCities.find(c =>
              c.name.toLowerCase() === city?.toLowerCase()
            )

            // Si no hay match exacto, intentar con la región
            if (!matchedCity && address.state) {
              matchedCity = colombianCities.find(c =>
                c.region.toLowerCase() === address.state?.toLowerCase()
              )
            }

            // Actualizar información del cliente
            setCustomerInfo(prev => ({
              ...prev,
              address: fullAddress || prev.address,
              city: matchedCity?.name || prev.city,
              region: matchedCity?.region || address.state || prev.region
            }))

            alert('📍 Ubicación detectada correctamente')
          }
        } catch (error) {
          console.error('Error obteniendo dirección:', error)
          alert('No se pudo obtener la dirección. Por favor ingrésala manualmente.')
        } finally {
          setLoadingLocation(false)
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error)
        setLoadingLocation(false)

        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert('Debes permitir el acceso a tu ubicación para usar esta función')
            break
          case error.POSITION_UNAVAILABLE:
            alert('No se pudo obtener tu ubicación. Inténtalo de nuevo.')
            break
          case error.TIMEOUT:
            alert('El tiempo de espera se agotó. Inténtalo de nuevo.')
            break
          default:
            alert('Error desconocido obteniendo tu ubicación')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Abrir modal de imagen
  const openImageModal = (sku, nombre) => {
    setImageModal({ isOpen: true, sku, nombre })
  }

  // Cerrar modal de imagen
  const closeImageModal = () => {
    setImageModal({ isOpen: false, sku: null, nombre: '' })
  }

  // Cambiar categoría y hacer scroll a productos
  const handleCategoryClick = (category) => {
    setActiveCategory(category)
    // Scroll suave a la sección de productos
    setTimeout(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Rastrear pedido
  const handleTrackOrder = () => {
    if (trackingInput.trim()) {
      setTrackingReference(trackingInput.trim())
      setIsTrackingModalOpen(true)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Home size={32} />
            <span>dtorreshaus</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', gap: '5px' }}>
              <input
                type="text"
                placeholder="DTH-xxxxx"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  width: '140px'
                }}
              />
              <button
                onClick={handleTrackOrder}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'white'
                  e.target.style.color = 'var(--primary-color)'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.color = 'white'
                }}
              >
                <Truck size={16} />
                Rastrear
              </button>
            </div>
            <button className="cart-button" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={20} />
              Carrito
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Estilo Rappi */}
      <nav className="nav">
        <div className="nav-buttons">
          {/* Botón "Todo" */}
          <button
            className={`nav-button ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <div className="nav-button-circle">
              <Home size={24} />
            </div>
            <span className="nav-button-label">Todo</span>
          </button>

          {/* Generar botones dinámicamente basados en categoryConfig */}
          {Object.entries(categoryConfig)
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([categoryKey, config]) => {
              const IconComponent = categoryIcons[categoryKey]
              const isComingSoon = config.comingSoon && !config.active

              return (
                <button
                  key={categoryKey}
                  className={`nav-button ${activeCategory === categoryKey ? 'active' : ''} ${isComingSoon ? 'coming-soon' : ''}`}
                  onClick={() => !isComingSoon && handleCategoryClick(categoryKey)}
                  disabled={isComingSoon}
                  style={{
                    opacity: isComingSoon ? 0.6 : 1,
                    cursor: isComingSoon ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="nav-button-circle">
                    {IconComponent && <IconComponent size={24} />}
                  </div>
                  <span className="nav-button-label">
                    {config.label}
                    {isComingSoon && <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Próximamente</span>}
                  </span>
                </button>
              )
            })
          }

          {/* Categorías dinámicas (no configuradas pero que tienen productos) */}
          {productsData && Object.keys(productsData)
            .filter(cat => !categoryConfig[cat])
            .map(categoryKey => (
               <button
                  key={categoryKey}
                  className={`nav-button ${activeCategory === categoryKey ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(categoryKey)}
                >
                  <div className="nav-button-circle">
                    <Package size={24} />
                  </div>
                  <span className="nav-button-label">
                    {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
                  </span>
                </button>
            ))
          }
        </div>
      </nav>

      {/* Search Bar */}
      <div className="container" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Buscar productos por nombre, descripción o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 45px',
                borderRadius: '25px',
                border: '2px solid var(--border-color)',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container">
        <div className="hero">
          <h1>Bienvenido a dtorreshaus</h1>
          <p>Tu tienda de artículos para el hogar en Colombia</p>
        </div>
      </div>

      {/* Products Section */}
      <main className="container">
        <section className="products-section" ref={productsSectionRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title">
              {searchTerm
                ? `Resultados para: "${searchTerm}"`
                : activeCategory === 'all'
                  ? 'Todos los Productos'
                  : categoryConfig[activeCategory]?.label || activeCategory
              }
            </h2>
            {usingFallback && (
              <span style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                Modo Offline
              </span>
            )}
          </div>
          
          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinning" style={{ display: 'inline-block', marginBottom: '15px' }}>
                <Package size={40} color="var(--primary-color)" />
              </div>
              <p style={{ color: '#666' }}>Cargando catálogo...</p>
            </div>
          ) : errorProducts && !productsData ? (
             <div style={{ textAlign: 'center', padding: '60px 0', background: '#fee2e2', borderRadius: '10px', color: '#991b1b' }}>
              <AlertCircle size={40} style={{ marginBottom: '15px' }} />
              <p>Error cargando los productos.</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '15px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Reintentar
              </button>
            </div>
          ) : getFilteredProducts().length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8f9fa', borderRadius: '10px' }}>
              <Search size={40} color="#ccc" style={{ marginBottom: '15px' }} />
              <p style={{ color: '#666' }}>No se encontraron productos.</p>
              {searchTerm && <button onClick={() => setSearchTerm('')} style={{ marginTop: '10px', padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Limpiar búsqueda</button>}
            </div>
          ) : (
            <div className="products-grid">
              {getFilteredProducts().map(product => (
                <div key={product.sku} className="product-card">
                  <ProductImage
                    sku={product.sku}
                    emoji={product.emoji}
                    onClick={() => openImageModal(product.sku, product.nombre)}
                  />
                  <div className="product-info">
                    <div className="product-sku">{product.sku}</div>
                    <h3 className="product-name">{product.nombre}</h3>
                    <p className="product-description">{product.descripcion}</p>
                    <div className="product-details">{product.material}</div>
                    <span className="product-category">{product.categoria}</span>
                    <div className="product-footer">
                      <span className="product-price">{formatPrice(product.precio)}</span>
                      <button
                        className="add-to-cart"
                        onClick={() => addToCart(product)}
                      >
                        <Plus size={16} />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Carrito de Compras</h2>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.sku} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-price">{formatPrice(item.precio)}</div>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.sku, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.sku, 1)}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.sku)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <>
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="cart-total-price">{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ padding: '20px', paddingTop: '0' }}>
                  <button
                    onClick={() => {
                      setIsCartOpen(false)
                      setIsCheckoutOpen(true)
                      setCheckoutStep('info')
                    }}
                    style={{
                      width: '100%',
                      padding: '15px',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <CreditCard size={20} />
                    Proceder al Pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              <X size={32} />
            </button>
            <h3 className="image-modal-title">{imageModal.nombre}</h3>
            <div className="image-modal-image">
              <img
                src={`/assets/products/${imageModal.sku}.jpeg`}
                alt={imageModal.nombre}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
            </div>
            <p className="image-modal-hint">SKU: {imageModal.sku}</p>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="cart-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="cart-header">
              <h2>Checkout</h2>
              <button className="close-cart" onClick={() => setIsCheckoutOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {checkoutStep === 'info' && (
              <div style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--dark-color)' }}>Información de Envío</h3>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid var(--border-color)',
                      fontSize: '16px'
                    }}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid var(--border-color)',
                      fontSize: '16px'
                    }}
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Teléfono *</label>
                  <input
                    type="tel"
                    name="tel"
                    autoComplete="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid var(--border-color)',
                      fontSize: '16px'
                    }}
                    placeholder="300 123 4567"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontWeight: '600' }}>Dirección *</label>
                    <button
                      type="button"
                      onClick={getUserLocation}
                      disabled={loadingLocation}
                      style={{
                        background: loadingLocation ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        cursor: loadingLocation ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: '500'
                      }}
                    >
                      <MapPin size={14} />
                      {loadingLocation ? 'Ubicando...' : 'Usar mi ubicación'}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid var(--border-color)',
                      fontSize: '16px'
                    }}
                    placeholder="Calle 123 #45-67, Apto 890"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    <MapPin size={18} style={{ display: 'inline', marginRight: '5px' }} />
                    Ciudad *
                  </label>
                  <select
                    value={customerInfo.city}
                    onChange={(e) => {
                      const selectedCity = colombianCities.find(c => c.name === e.target.value)
                      setCustomerInfo({
                        ...customerInfo,
                        city: e.target.value,
                        region: selectedCity?.region || 'Colombia'
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid var(--border-color)',
                      fontSize: '16px',
                      background: 'white'
                    }}
                  >
                    {colombianCities.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'var(--light-color)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Resumen del Pedido</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Subtotal ({cartItemCount} productos):</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Envío a {customerInfo.city}:</span>
                    <strong>{loadingShipping ? 'Calculando...' : formatPrice(shippingCost)}</strong>
                  </div>
                  <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                    <span>Total:</span>
                    <strong style={{ color: 'var(--accent-color)' }}>
                      {loadingShipping ? 'Calculando...' : formatPrice(cartTotal + shippingCost)}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
                      alert('Por favor completa todos los campos requeridos')
                      return
                    }
                    setCheckoutStep('payment')
                  }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Continuar al Pago
                </button>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <CheckoutSimple
                cart={cart}
                total={cartTotal}
                shippingCost={shippingCost}
                customerInfo={customerInfo}
                onClose={() => {
                  setIsCheckoutOpen(false)
                  setCheckoutStep('info')
                }}
                onSuccess={(result) => {
                  console.log('Pago exitoso:', result)
                  // El usuario será redirigido a Wompi automáticamente
                  // Cuando regrese de Wompi, podríamos mostrar confirmación
                  setCheckoutStep('confirmation')
                  setSelectedPaymentMethod(result.payment?.method || 'wompi')
                  // Guardar info de transferencia si aplica
                  if (result.payment?.instructions) {
                    sessionStorage.setItem('transfer_instructions', JSON.stringify(result.payment.instructions))
                  }
                }}
              />
            )}

            {checkoutStep === 'confirmation' && (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                  {selectedPaymentMethod === 'transfer' ? '💸' : '✅'}
                </div>
                <h3 style={{ marginBottom: '15px', color: 'var(--dark-color)' }}>
                  {selectedPaymentMethod === 'transfer' ? '¡Pedido Registrado!' : '¡Pedido Procesado!'}
                </h3>

                {selectedPaymentMethod === 'transfer' && (() => {
                  const instructions = JSON.parse(sessionStorage.getItem('transfer_instructions') || '{}')
                  return (
                    <div style={{ marginBottom: '20px', padding: '20px', background: '#fef3c7', borderRadius: '10px', border: '2px solid #f59e0b' }}>
                      <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '15px' }}>
                        📱 Instrucciones de Pago
                      </p>
                      <div style={{ textAlign: 'left', color: '#666' }}>
                        <p style={{ marginBottom: '8px' }}><strong>Banco:</strong> {instructions.bank}</p>
                        <p style={{ marginBottom: '8px' }}><strong>Nequi:</strong> {instructions.phone}</p>
                        <p style={{ marginBottom: '8px' }}><strong>A nombre de:</strong> {instructions.name}</p>
                        <p style={{ marginBottom: '8px' }}><strong>Referencia:</strong> <code style={{ background: 'white', padding: '2px 6px', borderRadius: '4px' }}>{instructions.reference}</code></p>
                        <p style={{ marginTop: '15px', fontSize: '14px', fontStyle: 'italic' }}>
                          Por favor envía el comprobante de pago a nuestro WhatsApp
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {selectedPaymentMethod !== 'transfer' && (
                  <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6' }}>
                    Tu pedido ha sido procesado exitosamente con <strong>{selectedPaymentMethod === 'pse' ? 'PSE' : selectedPaymentMethod === 'nequi' ? 'Nequi' : selectedPaymentMethod === 'card' ? 'Tarjeta' : 'Wompi'}</strong>.
                  </p>
                )}

                <p style={{ marginBottom: '20px', padding: '15px', background: 'var(--light-color)', borderRadius: '10px' }}>
                  <strong>Resumen del pedido:</strong><br />
                  Cliente: {customerInfo.name}<br />
                  Email: {customerInfo.email}<br />
                  Ciudad: {customerInfo.city}<br />
                  Total: {formatPrice(cartTotal + shippingCost)}
                </p>
                <button
                  onClick={() => {
                    setCart([])
                    setIsCheckoutOpen(false)
                    setCheckoutStep('info')
                    setSelectedPaymentMethod('')
                    sessionStorage.removeItem('transfer_instructions')
                  }}
                  style={{
                    padding: '15px 40px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Finalizar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {isTrackingModalOpen && (
        <OrderTracking
          reference={trackingReference}
          onClose={() => {
            setIsTrackingModalOpen(false)
            setTrackingInput('')
          }}
        />
      )}

      {/* Payment Confirmation Modal */}
      {paymentConfirmation.show && (
        <PaymentConfirmation
          transactionId={paymentConfirmation.transactionId}
          onClose={() => {
            setPaymentConfirmation({ show: false, transactionId: null })
            setCart([]) // Limpiar el carrito después de un pago exitoso
          }}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h3>dtorreshaus</h3>
          <p>Tu tienda de confianza para artículos del hogar</p>
          <p>Envíos a toda Colombia</p>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: '0.7' }}>
            © 2024 dtorreshaus. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
