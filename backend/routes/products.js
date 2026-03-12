/**
 * ====================================
 * RUTAS DE PRODUCTOS
 * ====================================
 * Endpoints para obtener información y gestionar productos
 */

const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authenticateAdmin } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Apuntar a la carpeta public/assets/products del frontend
    const dir = path.join(__dirname, '../../public/assets/products')
    // Crear el directorio si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    // Usaremos el SKU que venga en el body como nombre, o un hash aleatorio
    const sku = req.body.sku || 'default'
    // Extraer extensión (.jpeg, .png, .mp4, etc)
    const ext = path.extname(file.originalname)
    cb(null, `${sku}${ext}`)
  }
})
const upload = multer({ storage: storage })

/**
 * ====================================
 * ENDPOINTS PÚBLICOS
 * ====================================
 */

/**
 * GET /api/products
 * Obtener todos los productos activos
 */
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { categoria: 'asc' } // Opcional, para mantener un orden
    })

    // Organizar por categoría para coincidir con el formato esperado por el frontend
    const categorizedProducts = products.reduce((acc, product) => {
      // Necesitamos una clave de categoría que coincida con el frontend (ej. "labubu", "armas")
      // Extraemos la primera palabra de la categoría guardada (ej "Labubu - Pop Mart" -> "labubu")
      let categoryKey = product.categoria.split(' ')[0].toLowerCase()
      // Excepción para Gel Blasters que el front lo mapea a "armas"
      if (product.categoria.includes('Armas')) categoryKey = 'armas'

      if (!acc[categoryKey]) acc[categoryKey] = []
      acc[categoryKey].push(product)
      return acc
    }, {})

    res.json({
      success: true,
      data: categorizedProducts,
      raw: products // Por si el front prefiere el arreglo plano
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
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

    const product = await prisma.product.findUnique({ 
      where: { sku } 
    })

    if (!product) {
       return res.status(404).json({
         success: false,
         error: 'Producto no encontrado'
       })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo producto',
      message: error.message
    })
  }
})

/**
 * ====================================
 * ENDPOINTS DE ADMINISTRADOR
 * ====================================
 */

/**
 * GET /api/products/admin/all
 * Obtener TODOS los productos (incluyendo inactivos)
 */
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error obteniendo productos para admin:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/products/upload
 * Subir una imagen multimedia
 */
router.post('/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo' })
    }
    
    // Retornamos la ruta donde se guardó o el nombre
    res.json({
      success: true,
      message: 'Archivo subido correctamente',
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/products
 * Crear un nuevo producto
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { sku, nombre, descripcion, material, categoria, precio, emoji, stock, active } = req.body

    // Validación básica
    if (!sku || !nombre || !precio) {
      return res.status(400).json({
        success: false,
        error: 'SKU, nombre y precio son requeridos'
      })
    }

    // Comprobar si existe el SKU
    const existing = await prisma.product.findUnique({ where: { sku } })
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un producto con el SKU: ${sku}`
      })
    }

    const product = await prisma.product.create({
      data: {
        sku,
        nombre,
        descripcion: descripcion || '',
        material: material || '',
        categoria: categoria || 'General',
        precio: Number(precio),
        emoji: emoji || '📦',
        stock: stock ? Number(stock) : 0,
        active: active !== undefined ? active : true,
        slug: sku.toLowerCase()
      }
    })

    res.status(201).json({
      success: true,
      message: 'Producto creado',
      product
    })
  } catch (error) {
    console.error('Error creando producto:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    })
  }
})

/**
 * PUT /api/products/:id
 * Actualizar un producto existente
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { sku, nombre, descripcion, material, categoria, precio, emoji, stock, active } = req.body

    const updateData = {}
    if (sku !== undefined) updateData.sku = sku
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (material !== undefined) updateData.material = material
    if (categoria !== undefined) updateData.categoria = categoria
    if (precio !== undefined) updateData.precio = Number(precio)
    if (emoji !== undefined) updateData.emoji = emoji
    if (stock !== undefined) updateData.stock = Number(stock)
    if (active !== undefined) updateData.active = active
    if (sku !== undefined) updateData.slug = sku.toLowerCase()

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    res.json({
      success: true,
      message: 'Producto actualizado correctamented',
      product
    })
  } catch (error) {
    console.error('Error actualizando producto:', error)
    
    // Si el error es porque no se encontró el ID
    if (error.code === 'P2025') {
       return res.status(404).json({
         success: false,
         error: 'Producto no encontrado'
       })
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    })
  }
})

/**
 * DELETE /api/products/:id
 * Eliminar (hard delete) un producto
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.product.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    if (error.code === 'P2025') {
       return res.status(404).json({
         success: false,
         error: 'Producto no encontrado'
       })
    }
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

module.exports = router
