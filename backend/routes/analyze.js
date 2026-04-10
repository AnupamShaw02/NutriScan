import express from 'express'
import { analyzeProduct } from '../utils/gemini.js'

const router = express.Router()

// POST /api/analyze
// Body: { product: {...}, healthProfile: {...} }
// Used when you already have product data and just need Gemini analysis
router.post('/', async (req, res) => {
  const { product, healthProfile = {} } = req.body

  if (!product) {
    return res.status(400).json({ error: 'product is required' })
  }

  let analysis
  try {
    analysis = await analyzeProduct(product, healthProfile)
  } catch (err) {
    return res.status(502).json({ error: 'Gemini analysis failed', details: err.message })
  }

  return res.json({ analysis })
})

export default router
