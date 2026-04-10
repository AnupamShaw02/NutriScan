import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

function getSessionId() {
  let id = localStorage.getItem('nutriscan_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('nutriscan_session', id)
  }
  return id
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
})

api.interceptors.request.use((config) => {
  config.headers['x-session-id'] = getSessionId()
  return config
})

// Log the backend URL on every request so we can verify it in console
api.interceptors.request.use((config) => {
  console.log('[NutriScan] API call →', config.baseURL + config.url)
  return config
})

export async function scanBarcode(barcode, healthProfile = {}) {
  const res = await api.post('/api/scan/barcode', { barcode, healthProfile })
  return res.data
}

export async function scanImage(imageBase64, healthProfile = {}) {
  const res = await api.post('/api/scan/image', { imageBase64, healthProfile })
  return res.data
}

export async function analyzeProduct(product, healthProfile = {}) {
  const res = await api.post('/api/analyze', { product, healthProfile })
  return res.data
}

export function getHealthProfile() {
  try {
    return JSON.parse(localStorage.getItem('nutriscan_profile') || '{}')
  } catch {
    return {}
  }
}

export function saveHealthProfile(profile) {
  localStorage.setItem('nutriscan_profile', JSON.stringify(profile))
}

export function getScanHistory() {
  try {
    return JSON.parse(localStorage.getItem('nutriscan_history') || '[]')
  } catch {
    return []
  }
}

export function addToHistory(scanResult) {
  const history = getScanHistory()
  history.unshift({
    name: scanResult.product?.name || 'Unknown',
    brand: scanResult.product?.brand || '',
    image_url: scanResult.product?.image_url || '',
    verdict: scanResult.analysis?.verdict || 'moderation',
    scannedAt: new Date().toISOString(),
  })
  localStorage.setItem('nutriscan_history', JSON.stringify(history.slice(0, 10)))
}
