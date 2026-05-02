/**
 * ====================================
 * RUTAS DE ANALITICA FIRST-PARTY
 * ====================================
 */

const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const MAX_JSON_BYTES = 32 * 1024

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function trimString(value, maxLength = 255) {
  return typeof value === 'string' ? value.slice(0, maxLength) : value
}

function sanitizeJson(value) {
  if (!value) return undefined

  const json = JSON.stringify(value)
  if (Buffer.byteLength(json, 'utf8') > MAX_JSON_BYTES) {
    return { truncated: true }
  }

  return value
}

router.post('/', async (req, res) => {
  try {
    const {
      eventName,
      anonymousId,
      sessionId,
      userId,
      orderReference,
      sourceData,
      context,
      properties
    } = req.body || {}

    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'eventName es requerido'
      })
    }

    if (!anonymousId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'anonymousId o sessionId es requerido'
      })
    }

    const cleanEventName = trimString(eventName, 120)
    const cleanAnonymousId = trimString(anonymousId, 120)
    const cleanSessionId = trimString(sessionId, 120)
    const cleanUserId = trimString(userId, 120)
    const cleanOrderReference = trimString(orderReference, 120)
    const cleanSourceData = isPlainObject(sourceData) ? sanitizeJson(sourceData) : undefined
    const cleanContext = isPlainObject(context) ? sanitizeJson(context) : undefined
    const cleanProperties = isPlainObject(properties) ? sanitizeJson(properties) : undefined

    if (cleanSessionId) {
      await prisma.analyticsSession.upsert({
        where: { sessionId: cleanSessionId },
        update: {
          anonymousId: cleanAnonymousId || cleanSessionId,
          ...(cleanUserId && { userId: cleanUserId }),
          ...(cleanOrderReference && { orderReference: cleanOrderReference }),
          ...(cleanSourceData && { sourceData: cleanSourceData }),
          ...(cleanContext && { context: cleanContext }),
          ...(req.body.customerEmail && { customerEmail: trimString(req.body.customerEmail, 255) })
        },
        create: {
          sessionId: cleanSessionId,
          anonymousId: cleanAnonymousId || cleanSessionId,
          ...(cleanUserId && { userId: cleanUserId }),
          ...(cleanOrderReference && { orderReference: cleanOrderReference }),
          ...(cleanSourceData && { sourceData: cleanSourceData }),
          ...(cleanContext && { context: cleanContext }),
          ...(req.body.customerEmail && { customerEmail: trimString(req.body.customerEmail, 255) })
        }
      })
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventName: cleanEventName,
        anonymousId: cleanAnonymousId,
        sessionId: cleanSessionId,
        userId: cleanUserId,
        orderReference: cleanOrderReference,
        sourceData: cleanSourceData,
        context: cleanContext,
        properties: cleanProperties
      }
    })

    return res.status(201).json({
      success: true,
      id: event.id
    })
  } catch (error) {
    console.error('Error en POST /api/events:', error)
    return res.status(500).json({
      success: false,
      error: 'Error guardando evento'
    })
  }
})

module.exports = router
