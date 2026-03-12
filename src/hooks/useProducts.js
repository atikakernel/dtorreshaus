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
        const result = await getProducts()
        console.log("API Result:", result)
        
        if (result && result.success && result.data) {
          // Si el formato es un objeto ({"labubu": [], "armas": []}) 
          if (!Array.isArray(result.data)) {
            setProducts(result.data)
          } else {
            // Si es un arreglo por alguna razon, tratar de convertir a objeto
            const grouped = result.data.reduce((acc, p) => {
              let catKey = p.categoria ? p.categoria.split(' ')[0].toLowerCase() : 'otros'
              if (p.categoria && p.categoria.includes('Armas')) catKey = 'armas'
              if (!acc[catKey]) acc[catKey] = []
              acc[catKey].push(p)
              return acc
            }, {})
            setProducts(grouped)
          }
        } else if (Array.isArray(result)) {
           // Fallback en caso de que sea el viejo formato de array
           const grouped = result.reduce((acc, p) => {
              let catKey = p.categoria ? p.categoria.split(' ')[0].toLowerCase() : 'otros'
              if (p.categoria && p.categoria.includes('Armas')) catKey = 'armas'
              if (!acc[catKey]) acc[catKey] = []
              acc[catKey].push(p)
              return acc
            }, {})
           setProducts(grouped)
        } else {
           // Algún error inesperado en API
           console.error("API format unrecognised", result)
           setProducts(staticProductsData)
        }
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
