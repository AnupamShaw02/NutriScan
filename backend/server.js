import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import barcodeRouter from './routes/barcode.js'
import imageRouter from './routes/image.js'
import analyzeRouter from './routes/analyze.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}))
app.use(express.json({ limit: '10mb' }))  // 10mb to allow base64 images

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/scan/barcode', barcodeRouter)
app.use('/api/scan/image', imageRouter)
app.use('/api/analyze', analyzeRouter)

// Groq connectivity test
app.get('/api/test-gemini', async (req, res) => {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
        max_tokens: 10,
      }),
    })
    const data = await r.json()
    res.json({ success: r.ok, response: data.choices?.[0]?.message?.content, error: data.error })
  } catch (err) {
    res.json({ success: false, error: err.message })
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`NutriScan backend running on http://localhost:${PORT}`)
})
