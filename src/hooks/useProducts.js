import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import { productsData as fallbackData, categoryConfig } from '../productsData'

/**
 * Hook personalizado para manejar productos
 * Intenta cargar desde el API, si falla usa datos estáticos
 */
export function useProducts() {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getProducts()
        setProducts(data)
        setUsingFallback(false)
        setError(null)
      } catch (err) {
        console.warn('No se pudo cargar productos del API, usando datos estáticos:', err)
        // Usar datos estáticos como fallback
        setProducts(fallbackData)
        setUsingFallback(true)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error, usingFallback }
}
