/**
 * ====================================
 * RUTAS DE ADMIN - dtorreshaus
 * ====================================
 */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth')

/**
 * POST /api/admin/login
 * Iniciar sesión en el panel de admin
 */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere contraseña'
      })
    }

    // Verificar contraseña
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

    if (!ADMIN_PASSWORD) {
      console.error('❌ ADMIN_PASSWORD no configurado en .env')
      return res.status(500).json({
        success: false,
        error: 'Error de configuración del servidor'
      })
    }

    if (password !== ADMIN_PASSWORD) {
      console.log('⚠️  Intento de login fallido')
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta'
      })
    }

    // Generar token JWT válido por 7 días
    const token = jwt.sign(
      {
        role: 'admin',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login admin exitoso')

    return res.json({
      success: true,
      token,
      expiresIn: '7d'
    })
  } catch (error) {
    console.error('❌ Error en POST /api/admin/login:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * GET /api/admin/verify
 * Verificar si el token es válido
 */
router.get('/verify', authenticateAdmin, async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por el middleware)
    return res.json({
      success: true,
      valid: true,
      admin: {
        role: req.admin.role
      }
    })
  } catch (error) {
    console.error('❌ Error en GET /api/admin/verify:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

module.exports = router
