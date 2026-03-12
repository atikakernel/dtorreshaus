import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, X, RefreshCw, Save, Image as ImageIcon } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price || 0)
}

export function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    sku: '', nombre: '', descripcion: '', material: '', categoria: 'General', precio: '', emoji: '📦', stock: 10, active: true
  })
  const [actionLoading, setActionLoading] = useState(false)

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/products/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.products || [])
      } else {
        alert('Error cargando productos: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Filtrar productos
  const filteredProducts = products.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingProduct(null)
    setSelectedFile(null)
    setFormData({
      sku: '', nombre: '', descripcion: '', material: '', categoria: 'General', precio: '', emoji: '📦', stock: 10, active: true
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (product) => {
    setEditingProduct(product)
    setSelectedFile(null)
    setFormData({
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      material: product.material || '',
      categoria: product.categoria || 'General',
      precio: product.precio,
      emoji: product.emoji || '📦',
      stock: product.stock || 0,
      active: product.active
    })
    setIsModalOpen(true)
  }

  // Guardar (Crear o Editar)
  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.sku || !formData.nombre || !formData.precio) {
      alert('SKU, Nombre y Precio son campos obligatorios')
      return
    }

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token')
      const url = editingProduct 
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`
      const method = editingProduct ? 'PUT' : 'POST'

      // Transformar para el backend garantizando tipos
      const payload = {
        ...formData,
        precio: Number(formData.precio),
        stock: Number(formData.stock)
      }

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Subir imagen si se seleccionó una
        if (selectedFile) {
          const formDataImage = new FormData()
          formDataImage.append('image', selectedFile)
          formDataImage.append('sku', formData.sku) // Enviar SKU para renombrar
          
          await fetch(`${API_URL}/api/products/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataImage
          })
        }

        alert(editingProduct ? 'Producto actualizado' : 'Producto creado')
        setIsModalOpen(false)
        loadProducts()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error guardando:', error)
      alert('Error de conexión guardando producto')
    } finally {
      setActionLoading(false)
    }
  }

  // Eliminar (soft delete cambiando estado active, o hard delete dependiendo de backend)
  const handleDelete = async (id, sku) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto ${sku}?`)) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const result = await response.json()
      
      if (result.success) {
        loadProducts()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error eliminando:', error)
      alert('Error de conexión eliminando producto')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle estado activo
  const toggleActive = async (product) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ active: !product.active })
      })
      
      const result = await response.json()
      if (result.success) {
        // Actualizar estado local
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, active: !p.active } : p
        ))
      }
    } catch (error) {
      console.error('Error cambiando estado:', error)
      alert('Error cambiando estado del producto')
    }
  }

  return (
    <div>
      {/* Controles superiores */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Buscar por SKU, nombre, categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={loadProducts}
              disabled={loading}
              style={{
                padding: '10px 15px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '500'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Recargar
            </button>
            
            <button
              onClick={handleCreate}
              style={{
                padding: '10px 15px',
                border: 'none',
                borderRadius: '8px',
                background: '#6366f1',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '600'
              }}
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px' }}>
          <RefreshCw size={40} className="spinning" color="#6366f1" style={{ marginBottom: '15px' }} />
          <p>Cargando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px' }}>
          <ImageIcon size={64} color="#ccc" style={{ marginBottom: '20px' }} />
          <p style={{ color: '#666', fontSize: '16px' }}>No se encontraron productos</p>
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>Limpiar búsqueda</button>}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'center', width: '50px' }}>Img</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>SKU</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Categoría</th>
                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>Precio</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb', opacity: product.active ? 1 : 0.6 }}>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '24px' }}>
                    {product.emoji || '📦'}
                  </td>
                  <td style={{ padding: '15px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>
                    {product.sku}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '500' }}>{product.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                      {product.descripcion}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {product.categoria}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: product.active ? '#10b981' : '#94a3b8' }}>
                    {formatPrice(product.precio)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={product.active} 
                        onChange={() => toggleActive(product)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ marginLeft: '6px', fontSize: '12px', color: product.active ? '#10b981' : '#ef4444' }}>
                        {product.active ? 'Activo' : 'Oculto'}
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{ padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#6366f1', cursor: 'pointer' }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.sku)}
                        style={{ padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', color: '#ef4444', cursor: 'pointer' }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '15px', textAlign: 'right', fontSize: '13px', color: '#64748b', background: '#f8f9fa' }}>
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div 
            style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingProduct ? <Edit2 size={20} color="#6366f1" /> : <Plus size={20} color="#6366f1" />}
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    disabled={!!editingProduct} // El SKU usualmente no se edita después de creado para no romper URLs de imágenes
                    style={{
                      width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none',
                      background: editingProduct ? '#f1f5f9' : 'white', cursor: editingProduct ? 'not-allowed' : 'text'
                    }}
                    placeholder="Ej. JAC01-123"
                  />
                  {editingProduct && <span style={{ fontSize: '11px', color: '#94a3b8' }}>El SKU no se puede editar.</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Emoji/Ícono</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  placeholder="Ej. Lámpara de Mesa LED"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#0f172a' }}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Categoría</label>
                  <input
                    type="text"
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    list="categorias-list"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                  <datalist id="categorias-list">
                    <option value="General" />
                    <option value="Cocina" />
                    <option value="Baño" />
                    <option value="Limpieza" />
                    <option value="Organización" />
                    <option value="Decoración" />
                    <option value="Tecnología" />
                    <option value="Bienestar y Salud" />
                    <option value="Deportes y Exteriores" />
                    <option value="Labubu - Pop Mart" />
                    <option value="Armas en gel e hidrogel" />
                  </datalist>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Material/Info Extra</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    placeholder="Ej. Plástico ABS, 15x15cm"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Stock Disponible</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#334155' }}>Estado del Producto</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Los productos inactivos no se muestran en la tienda</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    style={{ width: '18px', height: '18px', marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: formData.active ? '#10b981' : '#ef4444' }}>
                    {formData.active ? 'Visible Público' : 'Oculto'}
                  </span>
                </label>
              </div>

              {/* Carga de Imagen */}
              <div style={{ marginTop: '15px', padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px dashed #bfdbfe' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ImageIcon size={16} /> Fotografía / Video
                </strong>
                <p style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '10px', marginTop: 0 }}>
                  Sube una foto (.jpeg, .png) o un video corto. Se nombrará automáticamente según el SKU.
                </p>
                <input 
                  type="file" 
                  accept="image/*,video/mp4" 
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ fontSize: '12px', width: '100%' }}
                />
              </div>

            </form>

            {/* Footer Modal */}
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: '500' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={actionLoading}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6366f1', color: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {actionLoading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
            
          </div>
        </div>
      )}

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
