/**
 * ====================================
 * RUTAS DE PRODUCTOS
 * ====================================
 * Endpoints para obtener información de productos
 */

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

/**
 * GET /api/products
 * Obtener todos los productos
 */
router.get('/', async (req, res) => {
  try {
    // Leer productos desde el frontend
    const productsPath = path.join(__dirname, '../../src/productsData.js')

    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({ error: 'Archivo de productos no encontrado' })
    }

    // En producción, deberías tener los productos en base de datos
    // Por ahora retornamos un mensaje indicando que se deben obtener del frontend

    res.json({
      success: true,
      message: 'Los productos están disponibles en el frontend',
      note: 'En producción, migra los productos a base de datos para mejor rendimiento'
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      error: 'Error obteniendo productos',
      message: error.message
    })
  }
})

/**
 * GET /api/products/:sku
 * Obtener producto por SKU
 */
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params

    // En producción, buscar en base de datos
    // const product = await prisma.product.findUnique({ where: { sku } })

    res.json({
      success: true,
      message: 'Producto encontrado',
      sku: sku
    })
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      error: 'Error obteniendo producto',
      message: error.message
    })
  }
})

module.exports = router
