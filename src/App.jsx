import { useState } from 'react'
import { ShoppingCart, Home, Heart, X, Plus, Minus, Trash2 } from 'lucide-react'

// Catálogo de productos
const productsData = {
  hogar: [
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
    }
  ],
  labubu: [
    {
      sku: 'LAB-001',
      nombre: 'Labubu Classic Rosa',
      descripcion: 'Adorable Labubu en color rosa pastel. El compañero perfecto para tu colección. Diseño original con detalles encantadores y expresión única.',
      material: 'Vinilo de alta calidad – 12 cm',
      categoria: 'Labubu – Coleccionables',
      precio: 89000,
      emoji: '🌸'
    },
    {
      sku: 'LAB-002',
      nombre: 'Labubu Classic Azul',
      descripcion: 'Labubu en tono azul cielo. Perfecto para decorar tu escritorio o estante. Material duradero y colores vibrantes.',
      material: 'Vinilo de alta calidad – 12 cm',
      categoria: 'Labubu – Coleccionables',
      precio: 89000,
      emoji: '💙'
    },
    {
      sku: 'LAB-003',
      nombre: 'Labubu Classic Blanco',
      descripcion: 'Labubu en elegante blanco puro. Un clásico atemporal para los verdaderos coleccionistas.',
      material: 'Vinilo de alta calidad – 12 cm',
      categoria: 'Labubu – Coleccionables',
      precio: 89000,
      emoji: '🤍'
    },
    {
      sku: 'LAB-004',
      nombre: 'Labubu Halloween Special',
      descripcion: 'Edición especial de Halloween con disfraz de bruja. Detalle único y limitado para los fans de Labubu.',
      material: 'Vinilo de alta calidad – 12 cm',
      categoria: 'Labubu – Edición Especial',
      precio: 125000,
      emoji: '🎃'
    },
    {
      sku: 'LAB-005',
      nombre: 'Labubu Navidad 2024',
      descripcion: 'Versión navideña con gorrito de Santa y bufanda. Perfecto para la temporada festiva.',
      material: 'Vinilo de alta calidad – 12 cm',
      categoria: 'Labubu – Edición Especial',
      precio: 125000,
      emoji: '🎅'
    },
    {
      sku: 'LAB-006',
      nombre: 'Labubu Mini Llavero',
      descripcion: 'Labubu en versión miniatura para llevar a todas partes. Incluye cadena y mosquetón metálico.',
      material: 'Vinilo – 6 cm',
      categoria: 'Labubu – Accesorios',
      precio: 35000,
      emoji: '🔑'
    },
    {
      sku: 'LAB-007',
      nombre: 'Set Labubu Rainbow (6 pcs)',
      descripcion: 'Set completo de 6 Labubus en colores del arcoíris. Incluye rosa, azul, amarillo, verde, morado y naranja.',
      material: 'Vinilo de alta calidad – 12 cm cada uno',
      categoria: 'Labubu – Sets',
      precio: 475000,
      emoji: '🌈'
    },
    {
      sku: 'LAB-008',
      nombre: 'Labubu Peluche Grande',
      descripcion: 'Versión en peluche súper suave y abrazable. Perfecto como almohada decorativa o compañero de descanso.',
      material: 'Felpa premium – 35 cm',
      categoria: 'Labubu – Peluches',
      precio: 189000,
      emoji: '🧸'
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

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Filtrar productos según categoría activa
  const getFilteredProducts = () => {
    if (activeCategory === 'all') {
      return [...productsData.hogar, ...productsData.labubu]
    } else if (activeCategory === 'hogar') {
      return productsData.hogar
    } else {
      return productsData.labubu
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
              Ver Todo
            </button>
            <button
              className={`nav-button ${activeCategory === 'hogar' ? 'active' : ''}`}
              onClick={() => setActiveCategory('hogar')}
            >
              <Home size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Artículos para el Hogar
            </button>
            <button
              className={`nav-button ${activeCategory === 'labubu' ? 'active' : ''}`}
              onClick={() => setActiveCategory('labubu')}
            >
              <Heart size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Labubus
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container">
        <div className="hero">
          <h1>Bienvenido a dtorreshaus</h1>
          <p>Tu tienda de artículos para el hogar y coleccionables Labubu en Colombia</p>
        </div>
      </div>

      {/* Products Section */}
      <main className="container">
        <section className="products-section">
          <h2 className="section-title">
            {activeCategory === 'all' && 'Todos los Productos'}
            {activeCategory === 'hogar' && 'Artículos para el Hogar'}
            {activeCategory === 'labubu' && 'Colección Labubu'}
          </h2>
          <div className="products-grid">
            {getFilteredProducts().map(product => (
              <div key={product.sku} className="product-card">
                <div className="product-image">
                  {product.emoji}
                </div>
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
          <p>Tu tienda de confianza para artículos del hogar y coleccionables</p>
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
