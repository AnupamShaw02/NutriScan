import fetch from 'node-fetch'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in Groq response')
  return JSON.parse(match[0])
}

// Clamp verdict to only the 3 allowed values
function sanitizeVerdict(verdict) {
  if (verdict === 'safe' || verdict === 'moderation' || verdict === 'caution') return verdict
  return 'moderation'
}

// Clamp level to only the 4 allowed values
function sanitizeLevel(level) {
  if (['low', 'medium', 'high', 'very-high'].includes(level)) return level
  return 'medium'
}

async function callGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

export async function analyzeProduct(productData, healthProfile) {
  const identifyNote = productData._gemini_identify
    ? `IMPORTANT: This product was NOT found in Open Food Facts. Barcode: ${productData.barcode}.
Use your knowledge to identify this product (it may be Indian or international).
Give your best analysis based on the barcode or product type. Always provide a verdict.`
    : ''

  const prompt = `You are a food safety assistant for Indian consumers.
Analyze this food product and respond ONLY in valid JSON — no markdown, no backticks, no text outside the JSON.
${identifyNote}

STRICT RULES:
- "verdict" MUST be exactly one of: "safe", "moderation", or "caution". No other value is allowed.
- "nutrition_levels" values MUST be exactly one of: "low", "medium", "high", "very-high".
- "flag" values MUST be exactly one of: "ok", "warning", "caution".
- If you cannot identify the product, still give a verdict based on typical products of that type.
- verdict "safe" = generally healthy, low concerns
- verdict "moderation" = has some concerning ingredients or nutrients, consume occasionally
- verdict "caution" = high sugar/sodium/harmful additives, avoid or rarely consume

Product data: ${JSON.stringify(productData)}
User health profile: ${JSON.stringify(healthProfile)}

Respond with EXACTLY this JSON structure (fill in real values, do not copy the example text):
{
  "product_name": "Actual product name if identifiable, else null",
  "verdict": "safe",
  "verdict_headline": "Short verdict in max 10 words",
  "label_clean": true,
  "label_concerns_count": 0,
  "profile_note": "Personalised warning for user health condition if relevant, else null",
  "ingredients_explained": [
    {
      "name": "E621",
      "plain_name": "MSG (Monosodium Glutamate)",
      "explanation": "A flavour enhancer. Generally safe in small amounts.",
      "flag": "warning",
      "source": "FSSAI | WHO Food Additives"
    }
  ],
  "nutrition_levels": {
    "calories": "medium",
    "sugar": "low",
    "sodium": "high",
    "protein": "medium"
  },
  "indian_context": "One sentence about this food in the context of Indian diet and consumption habits.",
  "hindi_verdict": "Verdict headline translated into simple Hindi"
}`

  const text   = await callGroq(prompt)
  const parsed = extractJSON(text)

  // Sanitize values so the frontend never breaks
  parsed.verdict = sanitizeVerdict(parsed.verdict)

  if (parsed.nutrition_levels) {
    for (const key of Object.keys(parsed.nutrition_levels)) {
      parsed.nutrition_levels[key] = sanitizeLevel(parsed.nutrition_levels[key])
    }
  }

  if (Array.isArray(parsed.ingredients_explained)) {
    parsed.ingredients_explained = parsed.ingredients_explained.map(ing => ({
      ...ing,
      flag: ['ok', 'warning', 'caution'].includes(ing.flag) ? ing.flag : 'ok',
    }))
  }

  // Pull product_name up into the product object
  if (parsed.product_name) {
    productData.name = parsed.product_name
    delete parsed.product_name
  }

  return parsed
}

export async function extractTextFromImage(base64Image, mimeType = 'image/jpeg') {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.2-90b-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          {
            type: 'text',
            text: 'Extract all visible text from this food product label or packaging. Include: product name, brand, ingredients list, nutrition facts table (calories, fat, sugar, sodium, protein, fiber per 100g), allergen warnings, weight/volume, and any other printed text. Return only the raw extracted text, nothing else.',
          },
        ],
      }],
      max_tokens: 1500,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq vision error ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}
