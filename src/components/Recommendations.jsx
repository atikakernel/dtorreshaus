import { useState, useEffect } from 'react';
import { Sparkles, Plus, ShoppingBag } from 'lucide-react';
import { getGeneralRecommendations, getPersonalizedRecommendations } from '../services/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

const ProductImage = ({ sku, emoji }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="product-image" style={{ background: '#f8f9fa', height: '120px' }}>
      {!imageError ? (
        <img
          src={`/assets/products/${sku}.jpeg`}
          alt={sku}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={{ fontSize: '40px' }}>{emoji}</div>
      )}
    </div>
  );
};

export const Recommendations = ({ addToCart, cart = [] }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let response;
        
        if (cart && cart.length > 0) {
          // Si hay carrito, pedir recomendaciones de Cross-selling
          response = await getPersonalizedRecommendations({ cart });
          setIsPersonalized(true);
        } else {
          // Si no hay nada, pedir las generales
          response = await getGeneralRecommendations();
          setIsPersonalized(false);
        }

        if (response.success) {
          setRecommendations(response.data);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    // Pequeño debounce para no saturar Ollama si el usuario agrega muchos items rápido
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 800);

    return () => clearTimeout(timer);
  }, [cart]);

  if (loading && recommendations.length === 0) {
    return (
      <div className="container" style={{ margin: '40px auto' }}>
        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
          <div className="spinning" style={{ display: 'inline-block', marginBottom: '10px' }}>
            <Sparkles size={24} color="var(--primary-color)" />
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>IA analizando {isPersonalized ? 'tu carrito' : 'el catálogo'}...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: isPersonalized 
              ? 'linear-gradient(135deg, #ff9a9e, #fad0c4)' 
              : 'linear-gradient(135deg, #667eea, #764ba2)', 
            padding: '8px', 
            borderRadius: '10px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {isPersonalized ? <ShoppingBag size={20} /> : <Sparkles size={20} />}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--dark-color)' }}>
              {isPersonalized ? '¡Completa tu compra!' : 'Recomendado por nuestra IA'}
            </h2>
            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
              {isPersonalized 
                ? 'Sugerencias basadas en lo que ya elegiste' 
                : 'Selección exclusiva de nuestro catálogo'}
            </p>
          </div>
        </div>
        
        {loading && (
          <div className="spinning" style={{ opacity: 0.5 }}>
            <Sparkles size={16} color="var(--primary-color)" />
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '20px',
        padding: '0 10px'
      }}>
        {recommendations.map((product) => (
          <div key={product.sku} className="product-card" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            border: '2px solid transparent',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = isPersonalized ? '#ff9a9e' : '#764ba2'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <ProductImage sku={product.sku} emoji={product.emoji} />
            <div className="product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '5px', fontWeight: '700' }}>{product.nombre}</h3>
                <span style={{ fontSize: '18px' }}>{product.emoji}</span>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: isPersonalized ? '#b24a4d' : '#764ba2', 
                background: isPersonalized ? '#fff5f5' : '#f3f0ff', 
                padding: '5px 8px', 
                borderRadius: '6px',
                marginBottom: '10px',
                fontStyle: 'italic',
                lineHeight: '1.3',
                borderLeft: `3px solid ${isPersonalized ? '#ff9a9e' : '#764ba2'}`
              }}>
                "{product.reason}"
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent-color)' }}>{formatPrice(product.precio)}</span>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    background: isPersonalized ? '#ff9a9e' : 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
