import express from 'express'
import { extractTextFromImage, analyzeProduct } from '../utils/gemini.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const { imageBase64, healthProfile = {} } = req.body

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' })
  }

  // Strip data URL prefix if present (e.g. "data:image/jpeg;base64,")
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

  // 1. Extract text from image via Gemini Vision
  let extractedText
  try {
    extractedText = await extractTextFromImage(base64Data, mimeType)
  } catch {
    return res.status(502).json({ error: 'Failed to read image with Gemini Vision' })
  }

  if (!extractedText || extractedText.trim().length < 10) {
    return res.status(422).json({ error: 'Could not extract readable text from image. Try barcode scan instead.' })
  }

  // 2. Build a product object from extracted text
  // Try to extract product name from first line of OCR text
  const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean)
  const guessedName = lines[0]?.length > 2 && lines[0]?.length < 80 ? lines[0] : 'Scanned Product'

  const product = {
    name: guessedName,
    brand: '',
    weight: '',
    image_url: '',
    ingredients_text: extractedText,
    nutriments: {},
    allergens: [],
    categories: '',
    categories_tags: [],
    _from_image: true,
  }

  // 3. Analyze with Gemini
  let analysis
  try {
    analysis = await analyzeProduct(product, healthProfile)
  } catch {
    return res.status(502).json({ error: 'Failed to analyze product with Gemini' })
  }

  return res.json({
    found: true,
    product,
    analysis,
    alternative: { found: false }
  })
})

export default router
