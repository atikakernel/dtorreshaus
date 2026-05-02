const ANONYMOUS_ID_KEY = 'dtorreshaus_anonymous_id'
const SOURCE_DATA_KEY = 'dtorreshaus_source_data'
const SESSION_ID_KEY = 'dtorreshaus_session_id'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function createId(prefix) {
  const random = Math.random().toString(36).slice(2)
  return `${prefix}_${Date.now()}_${random}`
}

function safeJsonParse(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function getAnonymousId() {
  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY)
  if (!anonymousId) {
    anonymousId = createId('anon')
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId)
  }
  return anonymousId
}

export function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = createId('sess')
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

export function captureSourceData() {
  const existing = safeJsonParse(localStorage.getItem(SOURCE_DATA_KEY))
  if (existing) return existing

  const params = new URLSearchParams(window.location.search)
  const sourceData = {
    referrer: document.referrer || null,
    landingPage: window.location.href,
    firstPath: window.location.pathname,
    capturedAt: new Date().toISOString()
  }

  for (const [key, value] of params.entries()) {
    if (key.startsWith('utm_') || ['gclid', 'fbclid', 'ttclid'].includes(key)) {
      sourceData[key] = value
    }
  }

  localStorage.setItem(SOURCE_DATA_KEY, JSON.stringify(sourceData))
  return sourceData
}

export function getAnalyticsContext() {
  return {
    anonymousId: getAnonymousId(),
    sessionId: getSessionId(),
    sourceData: captureSourceData(),
    context: {
      page: window.location.pathname,
      title: document.title,
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }
}

export function enrichOrderData(orderData) {
  const analytics = getAnalyticsContext()

  return {
    ...orderData,
    sourceData: analytics.sourceData,
    analyticsSessionId: analytics.sessionId
  }
}

export function trackEvent(eventName, properties = {}) {
  const analytics = getAnalyticsContext()
  const payload = {
    eventName,
    ...analytics,
    properties
  }
  const body = JSON.stringify(payload)
  const url = `${API_URL}/api/events`

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon(url, blob)) return
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(error => {
    console.warn('No se pudo registrar evento analytics:', error)
  })
}
