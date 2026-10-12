/**
 * ====================================
 * SERVICIO DE BÚSQUEDA DE PRODUCTOS
 * ====================================
 * Filtrado puro (sin Prisma) para el endpoint GET /api/products/search.
 * Se mantiene separado de las rutas para poder probarlo sin base de datos.
 */

/**
 * Normaliza texto para comparar: minúsculas y sin acentos.
 */
function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Filtra productos activos según criterios de búsqueda.
 *
 * @param {Array} products - Productos (forma del modelo Prisma Product)
 * @param {Object} criteria
 * @param {string} [criteria.q] - Texto libre: coincide contra nombre,
 *   descripción, material, categoría y SKU (sin importar acentos/mayúsculas).
 * @param {string} [criteria.categoria] - Coincidencia parcial de categoría.
 * @param {number} [criteria.minPrecio] - Precio mínimo (inclusive).
 * @param {number} [criteria.maxPrecio] - Precio máximo (inclusive).
 * @param {boolean} [criteria.inStock] - Si es true, solo stock > 0.
 * @returns {Array} Productos que cumplen todos los criterios dados.
 */
function filterProducts(products, criteria = {}) {
  const { q, categoria, minPrecio, maxPrecio, inStock } = criteria
  const query = normalizeText(q)
  const category = normalizeText(categoria)
  const min = minPrecio === undefined || minPrecio === null || minPrecio === '' ? null : Number(minPrecio)
  const max = maxPrecio === undefined || maxPrecio === null || maxPrecio === '' ? null : Number(maxPrecio)

  return (products || []).filter((product) => {
    if (query) {
      const haystack = normalizeText(
        [product.nombre, product.descripcion, product.material, product.categoria, product.sku]
          .filter(Boolean)
          .join(' ')
      )
      if (!haystack.includes(query)) return false
    }
    if (category && !normalizeText(product.categoria).includes(category)) return false
    if (min !== null && !Number.isNaN(min) && Number(product.precio) < min) return false
    if (max !== null && !Number.isNaN(max) && Number(product.precio) > max) return false
    if (inStock && !(Number(product.stock) > 0)) return false
    return true
  })
}

module.exports = { normalizeText, filterProducts }
