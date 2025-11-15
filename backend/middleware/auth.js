/**
 * ====================================
 * MIDDLEWARE DE AUTENTICACIÓN - dtorreshaus
 * ====================================
 */

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dtorreshaus-secret-key-change-in-production'

/**
 * Middleware para verificar token JWT en rutas de admin
 */
function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación'
      })
    }

    const token = authHeader.substring(7) // Remover "Bearer "

    try {
      const decoded = jwt.verify(token, JWT_SECRET)

      // Verificar que el token sea para admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este recurso'
        })
      }

      // Agregar información del usuario a la request
      req.admin = decoded
      next()
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado',
          expired: true
        })
      }

      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
}

module.exports = {
  authenticateAdmin,
  JWT_SECRET
}
