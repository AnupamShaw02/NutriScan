import express from 'express'
import fetch from 'node-fetch'
import { analyzeProduct } from '../utils/gemini.js'
import { pool } from '../db/client.js'

const router = express.Router()

// Try multiple OFFs endpoints — world first, then India-specific
async function fetchFromOFF(barcode) {
  const endpoints = [
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    `https://in.openfoodfacts.org/api/v0/product/${barcode}.json`,
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { timeout: 8000 })
      const data = await res.json()
      if (data.status === 1 && data.product) return data
    } catch {
      // try next endpoint
    }
  }
  return null
}

async function fetchAlternative(category, mainBarcode) {
  if (!category) return { found: false }
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&sort_by=nutriscore_score&page_size=5&json=1`
    const res = await fetch(url)
    const data = await res.json()
    const products = data.products || []
    const alt = products.find(p => p.code !== mainBarcode && p.product_name && p.image_url)
    if (!alt) return { found: false }
    return {
      found: true,
      name: alt.product_name,
      brand: alt.brands || '',
      image_url: alt.image_url || '',
      why_better: buildWhyBetter(alt)
    }
  } catch {
    return { found: false }
  }
}

function buildWhyBetter(alt) {
  const reasons = []
  const n = alt.nutriments || {}
  if (n['sodium_100g'] != null && n['sodium_100g'] < 0.6) reasons.push('Lower sodium')
  if (n['sugars_100g'] != null && n['sugars_100g'] < 10) reasons.push('Less sugar')
  if (n['proteins_100g'] != null && n['proteins_100g'] > 5) reasons.push('More protein')
  if (n['saturated-fat_100g'] != null && n['saturated-fat_100g'] < 3) reasons.push('Less saturated fat')
  if (reasons.length === 0) reasons.push('Better nutritional profile')
  return reasons
}

router.post('/', async (req, res) => {
  const { barcode, healthProfile = {} } = req.body

  if (!barcode) {
    return res.status(400).json({ error: 'barcode is required' })
  }

  // 1. Fetch from Open Food Facts (tries world + India endpoints)
  const offData = await fetchFromOFF(barcode)

  let product
  if (!offData) {
    // OFFs doesn't have this product — use Gemini to identify it from barcode alone
    product = {
      name: `Product (barcode: ${barcode})`,
      brand: '',
      weight: '',
      image_url: '',
      ingredients_text: '',
      nutriments: {},
      allergens: [],
      categories: '',
      categories_tags: [],
      barcode,
      _gemini_identify: true   // signal to Gemini to identify first
    }
  } else {
    const p = offData.product
    product = {
      name: p.product_name || p.product_name_en || p.abbreviated_product_name || 'Unknown Product',
      brand: p.brands || '',
      weight: p.quantity || '',
      image_url: p.image_front_url || p.image_url || '',
      ingredients_text: p.ingredients_text || p.ingredients_text_en || '',
      nutriments: p.nutriments || {},
      allergens: p.allergens_tags || [],
      categories: p.categories || '',
      categories_tags: p.categories_tags || []
    }
  }

  // 2. Analyze with Gemini
  let analysis
  try {
    analysis = await analyzeProduct(product, healthProfile)
  } catch (err) {
    console.error('Gemini error:', err.message)
    analysis = {
      verdict: 'moderation',
      verdict_headline: 'Could not analyze — check ingredients manually',
      label_clean: false,
      label_concerns_count: 0,
      profile_note: null,
      ingredients_explained: [],
      nutrition_levels: { calories: 'medium', sugar: 'medium', sodium: 'medium', protein: 'medium' },
      indian_context: '',
      hindi_verdict: 'विश्लेषण उपलब्ध नहीं'
    }
  }

  // 3. Fetch alternative (only if not safe)
  let alternative = { found: false }
  if (analysis.verdict !== 'safe') {
    const category = product.categories_tags[0] || ''
    alternative = await fetchAlternative(category, barcode)
  }

  // 4. Save to DB (fire-and-forget)
  const sessionId = req.headers['x-session-id'] || 'unknown'
  pool.query(
    'INSERT INTO scan_history (session_id, barcode, product_name, brand, verdict, product_data) VALUES ($1,$2,$3,$4,$5,$6)',
    [sessionId, barcode, product.name, product.brand, analysis.verdict, JSON.stringify({ product, analysis })]
  ).catch(() => {})

  return res.json({ found: true, product, analysis, alternative })
})

export default router
