import { useState } from 'react'
import { ShoppingCart, Home, X, Plus, Minus, Trash2, ChefHat, Droplet, Sparkles } from 'lucide-react'

// Catálogo de productos organizados por sección
const productsData = {
  cocina: [
    {
      sku: 'JAC01-5',
      nombre: 'Dispensador de vidrio con bomba cromada – 200 ml',
      descripcion: 'Dispensador de vidrio transparente con tapa metálica cromada y bomba dosificadora. Ideal para jabón líquido, aceite o vinagre. Presentación en caja individual.',
      material: 'Vidrio / Acero inox. – 200 ml – 14.5 × 6 cm',
      categoria: 'Hogar / Cocina – Accesorios',
      precio: 9900,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-6',
      nombre: 'Botella térmica de vidrio con tapa metálica – 500 ml',
      descripcion: 'Botella de vidrio transparente con tapa de acero y recubrimiento exterior de colores surtidos. Perfecta para agua, jugos o té. Caja individual tipo "colour box".',
      material: 'Vidrio / Acero inox. – 500 ml – 17 cm alto',
      categoria: 'Hogar / Cocina – Hidratación',
      precio: 14500,
      emoji: '🍶'
    },
    {
      sku: 'JAC01-7',
      nombre: 'Dispensador de aceite o vinagre – 170 ml',
      descripcion: 'Botella dispensadora de vidrio con pico vertedor metálico. Ideal para aceite de oliva o vinagre. Presentación individual en caja transparente.',
      material: 'Vidrio / Acero inox. – 170 ml – 17 × 4 cm',
      categoria: 'Hogar / Cocina – Utensilios',
      precio: 10200,
      emoji: '🫒'
    },
    {
      sku: 'JAC01-8',
      nombre: 'Pulverizador de aceite – 300 ml (blanco / negro)',
      descripcion: 'Atomizador recargable de cocina para aceite o vinagre, con boquilla de pulverización fina y disponible en blanco y negro. Presentación en caja.',
      material: 'Plástico PET / Acero – 300 ml – 20 × 5.5 cm',
      categoria: 'Hogar / Cocina – Utensilios',
      precio: 18900,
      emoji: '💦'
    },
    {
      sku: 'JAC01-20',
      nombre: 'Vaso alto de vidrio facetado – 475 ml',
      descripcion: 'Vaso de vidrio transparente con diseño facetado tipo restaurante. Ideal para jugos, refrescos o cócteles. Apto para lavavajillas.',
      material: 'Vidrio – 475 ml – 15 cm alto',
      categoria: 'Hogar / Cocina – Vajilla',
      precio: 6500,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-163',
      nombre: 'Vaso alto de vidrio Hua Xin – 500 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo liso y base gruesa. Resistente y elegante para uso diario.',
      material: 'Vidrio – 500 ml – 16 cm alto',
      categoria: 'Hogar / Cocina – Vajilla',
      precio: 6900,
      emoji: '🥛'
    },
    {
      sku: 'JAC01-164',
      nombre: 'Vaso alto estriado – 450 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo estriado vertical y acabado brillante. Diseño ergonómico y resistente.',
      material: 'Vidrio – 450 ml – 16.5 cm alto',
      categoria: 'Hogar / Cocina – Vajilla',
      precio: 6500,
      emoji: '🍹'
    },
    {
      sku: 'JAC01-165',
      nombre: 'Vaso largo liso – 450 ml',
      descripcion: 'Vaso de vidrio transparente sin relieve, acabado cristalino y base gruesa. Ideal para bebidas frías y cocteles.',
      material: 'Vidrio – 450 ml – 16 cm alto',
      categoria: 'Hogar / Cocina – Vajilla',
      precio: 6400,
      emoji: '🥃'
    },
    {
      sku: 'JAC01-22',
      nombre: 'Set de contenedores herméticos rosados – 3 piezas',
      descripcion: 'Set de tres recipientes redondos de vidrio con tapas rosadas herméticas. Aptos para microondas y refrigerador. Tamaños: 17×7 cm, 15×7 cm, 13×6 cm.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Hogar / Cocina – Almacenamiento',
      precio: 29000,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-23',
      nombre: 'Set de contenedores herméticos rosados – 3 piezas (variación B)',
      descripcion: 'Conjunto de tres contenedores herméticos rosados con diferente profundidad y capacidad. Sellado seguro y apilables.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Hogar / Cocina – Almacenamiento',
      precio: 29000,
      emoji: '🍱'
    },
    {
      sku: 'JAC01-24',
      nombre: 'Recipiente hermético de vidrio con tapa rosada – 650 ml',
      descripcion: 'Contenedor individual de vidrio templado con tapa hermética rosada, ideal para conservar alimentos. Apto para microondas y refrigerador.',
      material: 'Vidrio / Silicona – 650 ml – 14 × 6 cm',
      categoria: 'Hogar / Cocina – Almacenamiento',
      precio: 12900,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-39',
      nombre: 'Mini selladores plásticos de colores – Set 12 unidades',
      descripcion: 'Selladores plásticos de colores para bolsas de snacks o alimentos. Prácticos y resistentes. Precio por unidad 0.32 CNY.',
      material: 'Plástico PP – 12 pzas – 0.32 CNY c/u',
      categoria: 'Hogar / Cocina – Organización',
      precio: 3500,
      emoji: '📎'
    }
  ],
  baño: [
    {
      sku: 'JAC01-28',
      nombre: 'Dispensador de jabón cerámico beige con dosificador dorado – 300 ml',
      descripcion: 'Dosificador decorativo de baño o cocina, en cerámica color beige con acabado brillante y bomba dorada metálica.',
      material: 'Cerámica / Metal – 300 ml – 7.8 CNY',
      categoria: 'Hogar / Baño',
      precio: 18900,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-29',
      nombre: 'Dispensador de jabón gris con tapa de madera clara – 280 ml',
      descripcion: 'Elegante dispensador gris texturizado con tapa tipo bambú y bomba plateada. Ideal para baño moderno.',
      material: 'Cerámica / Metal – 280 ml – 6.1 CNY',
      categoria: 'Hogar / Baño',
      precio: 15000,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-30',
      nombre: 'Dispensador de jabón gris oscuro con tapa de bambú – 280 ml',
      descripcion: 'Variante más oscura del modelo anterior, con bomba metálica plateada y cuerpo gris antracita texturizado.',
      material: 'Cerámica / Metal – 280 ml – 6.4 CNY',
      categoria: 'Hogar / Baño',
      precio: 15500,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-31',
      nombre: 'Dispensador de jabón gris con base transparente – 250 ml',
      descripcion: 'Dispensador moderno con cuerpo gris mate y base transparente. Bomba metálica cromada resistente.',
      material: 'Plástico ABS / Metal – 250 ml – 9.5 CNY',
      categoria: 'Hogar / Baño',
      precio: 17900,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-32',
      nombre: 'Dispensador de jabón cerámico blanco con detalles dorados – 300 ml',
      descripcion: 'Dosificador blanco elegante con líneas doradas y bomba metálica. Perfecto para baño o tocador.',
      material: 'Cerámica / Metal – 300 ml – 7.9 CNY',
      categoria: 'Hogar / Baño',
      precio: 18500,
      emoji: '✨'
    },
    {
      sku: 'JAC01-33',
      nombre: 'Set 3 piezas de baño gris – vaso + jabón + cepillo',
      descripcion: 'Set completo de baño color gris oscuro, incluye dispensador, vaso y portacepillos. Diseño moderno con textura vertical.',
      material: 'Cerámica / Metal – 3 pzas – 15.5 CNY',
      categoria: 'Hogar / Baño – Sets',
      precio: 35000,
      emoji: '🛁'
    }
  ],
  limpieza: [
    {
      sku: 'JAC01-34',
      nombre: 'Paños de microfibra multicolor – Set 5 unidades 30×30 cm',
      descripcion: 'Paños suaves y absorbentes de microfibra con colores surtidos. Perfectos para limpieza de cocina y superficies.',
      material: 'Microfibra – 30×30 cm – 4.1 CNY / 5 pcs',
      categoria: 'Hogar / Limpieza',
      precio: 8500,
      emoji: '🧽'
    },
    {
      sku: 'JAC01-35',
      nombre: 'Paños de microfibra neutros – Set 5 unidades 30×30 cm',
      descripcion: 'Paños beige y marrones de microfibra gruesa con alta absorción. Reutilizables y lavables.',
      material: 'Microfibra – 30×30 cm – 3.5 CNY / 5 pcs',
      categoria: 'Hogar / Limpieza',
      precio: 7500,
      emoji: '🧽'
    }
  ]
}

// Formato de precio colombiano
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

// Componente para imagen del producto con fallback
const ProductImage = ({ sku, emoji }) => {
  const [imageError, setImageError] = useState(false)
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp']

  // Intentar cargar imagen desde assets
  const tryLoadImage = () => {
    if (imageError) return null

    // Intentamos con la primera extensión por defecto
    const imagePath = `/assets/products/${sku}.jpg`
    return (
      <img
        src={imagePath}
        alt={sku}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div className="product-image">
      {!imageError ? tryLoadImage() : emoji}
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Filtrar productos según categoría activa
  const getFilteredProducts = () => {
    if (activeCategory === 'all') {
      return [...productsData.cocina, ...productsData.baño, ...productsData.limpieza]
    } else if (activeCategory === 'cocina') {
      return productsData.cocina
    } else if (activeCategory === 'baño') {
      return productsData.baño
    } else {
      return productsData.limpieza
    }
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

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Home size={32} />
            <span>dtorreshaus</span>
          </div>
          <button className="cart-button" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={20} />
            Carrito
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-buttons">
            <button
              className={`nav-button ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <Home size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Ver Todo
            </button>
            <button
              className={`nav-button ${activeCategory === 'cocina' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cocina')}
            >
              <ChefHat size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Cocina
            </button>
            <button
              className={`nav-button ${activeCategory === 'baño' ? 'active' : ''}`}
              onClick={() => setActiveCategory('baño')}
            >
              <Droplet size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Baño
            </button>
            <button
              className={`nav-button ${activeCategory === 'limpieza' ? 'active' : ''}`}
              onClick={() => setActiveCategory('limpieza')}
            >
              <Sparkles size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Limpieza
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container">
        <div className="hero">
          <h1>Bienvenido a dtorreshaus</h1>
          <p>Tu tienda de artículos para el hogar en Colombia</p>
        </div>
      </div>

      {/* Products Section */}
      <main className="container">
        <section className="products-section">
          <h2 className="section-title">
            {activeCategory === 'all' && 'Todos los Productos'}
            {activeCategory === 'cocina' && 'Cocina'}
            {activeCategory === 'baño' && 'Baño'}
            {activeCategory === 'limpieza' && 'Limpieza'}
          </h2>
          <div className="products-grid">
            {getFilteredProducts().map(product => (
              <div key={product.sku} className="product-card">
                <ProductImage sku={product.sku} emoji={product.emoji} />
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
              <div className="cart-total">
                <span>Total:</span>
                <span className="cart-total-price">{formatPrice(cartTotal)}</span>
              </div>
            )}
          </div>
        </div>
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
