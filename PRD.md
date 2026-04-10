# NutriScan — Product Requirements Document
## HackHorizon 2K26 | Team of 5 | 16 Hours

---

## 1. Problem Statement

Consumers in India cannot quickly understand the ingredients and nutritional value of packaged food products while shopping. Food labels are in English, filled with INS codes, and give no guidance on whether the product suits their personal health condition (diabetes, allergies, weight loss, etc.).

**The gap existing apps leave:**
- Yuka → Western-focused, score of 68/100 (meaningless to most users), personalization behind paywall
- Read the Labels → no Indian products, no personalization, no language support
- All apps → show raw data, not decisions
- No app → explains INS codes in plain Hindi/English with scientific source cited
- No app → personalizes verdict to your health condition for free
- No app → suggests a better alternative product after showing you what's wrong

---

## 2. Product Name

**NutriScan** — *"Scan it. Understand it. Decide it."*

---

## 3. One-Line Pitch

> "We turn confusing food labels into simple, personalized decisions for every Indian."

---

## 4. What We Are Building

A **Progressive Web App (PWA)** — works on any phone browser like a native app, no installation needed. Users open a link, scan a product, get an instant verdict.

**Not a native Android/iOS app. Not a website. A PWA — best of both.**

---

## 5. Core Features (Build These 5. Nothing Else.)

### Feature 1 — Multi-Modal Scan
Users can scan a product in 2 ways:

| Method | How | Library/API |
|--------|-----|-------------|
| Barcode / QR Code | Camera-based scan | `html5-qrcode` |
| Product Image | Photo of front label | Gemini Vision API |

**Fallback:** If barcode not found in database → automatically prompt image scan.

---

### Feature 2 — Smart Verdict Card (THE HERO FEATURE)
The most important screen. After scanning, user sees a large, colored verdict:

```
┌─────────────────────────────────┐
│                                 │
│     🟡  EAT IN MODERATION      │
│                                 │
│  High sodium + refined flour    │
│  Okay once a week               │
│                                 │
│  For diabetics: Avoid daily     │
│                                 │
└─────────────────────────────────┘
```

**3 possible verdicts:**
- 🟢 **SAFE** — green card
- 🟡 **EAT IN MODERATION** — yellow card
- 🔴 **AVOID** — red card

**Verdict logic (rule-based, not AI):**

| Condition | Rule | Verdict |
|-----------|------|---------|
| Sugar per 100g > 22.5g | Always | MODERATION |
| Sugar per 100g > 30g | Always | CAUTION |
| Sodium per 100g > 600mg | Always | MODERATION |
| Saturated fat per 100g > 5g | Always | MODERATION |
| Contains user's allergen | Profile match | AVOID |
| Sugar > 15g + user is Diabetic | Profile match | AVOID |
| All values within range | Default | SAFE |

These thresholds are based on FSSAI daily recommended values — cite this to judges.

---

### Feature 3 — Label Report (Ingredient Translator)
Renamed from "Ingredients" to "Label Report" — language borrowed from Read the Labels app. Sounds like an audit, not a list. More credible to judges.

Transform unreadable label text into plain language. Each ingredient gets:
- Plain name (INS 211 → Sodium Benzoate)
- One-line explanation
- Risk flag: `ok` / `warning` / `caution`
- Scientific source citation (EFSA / WHO / FSSAI)

**Example:**
```
Label Report                          🟡 Not Clean — 2 concerns
─────────────────────────────────────────────────
  ✓   Wheat Flour         — main ingredient, generally safe
                            Source: FSSAI approved
  ⚠️  INS 508             — Potassium Chloride
                            Salt substitute, safe in moderation
                            Source: EFSA 2019
  ⚠️  INS 635             — Disodium Ribonucleotides
                            Flavour enhancer, avoid if gout-prone
                            Source: WHO Food Additives
```

**"Not Clean" header logic:** If 1+ ingredients flagged `warning`, show "🟡 Not Clean — X concerns". If 0, show "✅ Clean Label". This is the same mental model Read the Labels uses — judges who know that app will immediately recognize you've done better.

**How:** Send ingredient list to Gemini API. Gemini returns plain-English explanations + source for each ingredient.

---

### Feature 4 — Better Alternative (Yuka charges ₹800/year for this — we do it free)
After the verdict card, if the product is MODERATION or CAUTION, show one better alternative from the same product category.

**How it works:**
1. Open Food Facts barcode scan returns `categories_tags` (e.g. `"en:instant-noodles"`)
2. Call Open Food Facts search: `/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=[category]&sort_by=nutriscore_score&json=1`
3. Pick the first result with a better nutritional profile
4. Display as a compact card below the verdict

**Example:**
```
┌─────────────────────────────────┐
│  Try instead               →   │
│  [img]  Sunfeast Farmlite       │
│         Digestive Oats Cookies  │
│         Lower sodium · More protein │
└─────────────────────────────────┘
```

**Important:** This is one API call. No extra AI. No extra backend work. P1 adds it to the barcode route in 20 minutes. This feature alone differentiates NutriScan from every student hackathon project.

---

### Feature 5 — Health Profile (No Login Required)
User sets their profile once. Stored in browser `localStorage`. No account needed.

**Profile options (checkboxes):**
- [ ] Diabetic
- [ ] Heart Patient (hypertension)
- [ ] Weight Loss / Calorie conscious
- [ ] Vegan
- [ ] Nut Allergy
- [ ] Gluten Intolerance
- [ ] Lactose Intolerant

Profile is read on every scan result to personalize the verdict and show a "For YOU" note.

---

## 6. What We Are NOT Building

Tell every team member. These are hard NOs:

| Do NOT Build | Why |
|-------------|-----|
| Login / Register / Auth | Kills 3 hours. Use localStorage instead |
| User database in MongoDB | Not needed. Profile = localStorage, history = optional |
| OCR on nutrition label text | Too unreliable on handwritten/blurry labels |
| Meal planner / calorie tracker | Out of scope |
| Social features / sharing | Out of scope |
| Full product comparison page | Out of scope — simple "better alternative" card is enough |
| Voice input | Out of scope |
| Native Android/iOS app | PWA covers it better for demo |
| Complex ML models | Gemini handles all AI needs |

---

## 7. Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React + Vite | UI framework, fast dev server |
| Tailwind CSS | Styling — dark theme, premium look |
| React Router v6 | Page navigation |
| `html5-qrcode` | Barcode + QR scanning via camera |
| `axios` | API calls to backend |
| `vite-plugin-pwa` | Makes app installable on phone |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | API server |
| `@google/generative-ai` | Gemini API SDK |
| `node-fetch` | Call Open Food Facts API |
| `cors` | Allow frontend to call backend |
| `dotenv` | Environment variables |
| `multer` | Handle image uploads (if needed) |

### External APIs (Both Free)
| API | Purpose | Key Required |
|-----|---------|-------------|
| Open Food Facts | Barcode → product data | No — completely free |
| Gemini 1.5 Flash | Ingredient analysis + image scan | Yes — free at aistudio.google.com |

### Database
| Tool | Purpose |
|------|---------|
| Neon PostgreSQL | Hosted serverless Postgres — free tier, no credit card |
| `pg` npm package | Connect backend to Neon via DATABASE_URL |

**Why Neon over MongoDB Atlas:**
- Zero config — create project, get a connection string, done
- Standard SQL — easier to explain to judges ("it's PostgreSQL")
- Free tier: 512MB, 1 project, unlimited reads/writes
- Dashboard at neon.tech shows live data — great for demo

**Setup (5 minutes):**
1. Go to `neon.tech` → New Project → copy `DATABASE_URL`
2. Paste in backend `.env` as `DATABASE_URL=postgres://...`
3. Run the schema SQL once to create tables

### Hosting (Both Free)
| Service | What |
|---------|------|
| Vercel | Frontend (auto-deploys from GitHub) |
| Render | Backend (free tier) |
| Neon | PostgreSQL database (free tier) |

---

## 8. Folder Structure

```
nutriscan/
├── frontend/                  ← React + Vite app
│   ├── public/
│   │   └── manifest.json      ← PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── VerdictCard.jsx        ← THE hero component
│   │   │   ├── IngredientPill.jsx     ← individual ingredient card
│   │   │   ├── NutrientBar.jsx        ← visual nutrition bar
│   │   │   ├── HealthProfileForm.jsx  ← checkbox form
│   │   │   ├── BarcodeScanner.jsx     ← html5-qrcode wrapper
│   │   │   ├── ImageUploader.jsx      ← camera/file input
│   │   │   └── LoadingState.jsx       ← animated loading
│   │   ├── pages/
│   │   │   ├── Home.jsx               ← landing + scan button
│   │   │   ├── Result.jsx             ← full scan result
│   │   │   └── Profile.jsx            ← health profile setup
│   │   ├── utils/
│   │   │   ├── verdictLogic.js        ← rule-based verdict calculator
│   │   │   └── api.js                 ← axios calls to backend
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   ← Node.js + Express
│   ├── routes/
│   │   ├── barcode.js         ← POST /api/scan/barcode
│   │   ├── image.js           ← POST /api/scan/image
│   │   └── analyze.js         ← POST /api/analyze
│   ├── db/
│   │   ├── client.js          ← pg Pool connection
│   │   └── schema.sql         ← run once to create tables
│   ├── utils/
│   │   └── gemini.js          ← Gemini API wrapper
│   ├── server.js              ← Express entry point
│   ├── .env                   ← GEMINI_API_KEY + DATABASE_URL (never commit)
│   ├── .gitignore             ← must include .env
│   └── package.json
│
└── README.md
```

---

## 9. API Routes (Backend)

### Route 1: Barcode Scan
```
POST /api/scan/barcode
Body: { "barcode": "8901058155018", "healthProfile": { diabetic: true, ... } }
Response: {
  "found": true,
  "product": { name, brand, ingredients, nutriments, allergens, image_url, categories },
  "analysis": {
    verdict, verdict_headline, label_clean, label_concerns_count,
    profile_note, ingredients_explained, nutrition_levels,
    indian_context, hindi_verdict
  },
  "alternative": {
    "found": true,
    "name": "Sunfeast Farmlite Digestive",
    "brand": "ITC",
    "image_url": "...",
    "why_better": "Lower sodium, more protein"
  }
}
```

### Route 2: Image Scan
```
POST /api/scan/image
Body: { "imageBase64": "data:image/jpeg;base64,..." }
Response: same structure as Route 1
```

### Route 3: Health Check
```
GET /api/health
Response: { "status": "ok" }
```

---

## 10. Gemini Prompt (Critical — Do Not Change)

```
You are a food safety assistant for Indian consumers. 
Analyze this food product and respond ONLY in valid JSON with no extra text.
Do not include markdown, backticks, or any explanation outside the JSON.

Product: [PRODUCT_DATA]
User profile: [HEALTH_PROFILE]

{
  "verdict": "safe" | "moderation" | "caution",
  "verdict_headline": "max 10 words explaining the verdict",
  "label_clean": true | false,
  "label_concerns_count": 0,
  "profile_note": "personalized note for user health condition, or null",
  "ingredients_explained": [
    {
      "name": "INS 211",
      "plain_name": "Sodium Benzoate",
      "explanation": "one sentence plain English explanation",
      "flag": "ok" | "warning" | "caution",
      "source": "EFSA 2019 | WHO Food Additives | FSSAI | Generally recognized"
    }
  ],
  "nutrition_levels": {
    "calories": "low" | "medium" | "high",
    "sugar": "low" | "medium" | "high",
    "sodium": "low" | "medium" | "high",
    "protein": "low" | "medium" | "high"
  },
  "indian_context": "one sentence about this food in Indian diet context",
  "hindi_verdict": "verdict_headline translated to Hindi in simple words"
}
```

**New fields explained:**
- `label_clean` → drives the "✅ Clean Label" / "🟡 Not Clean" header on Label Report section
- `label_concerns_count` → number of `warning` or `caution` flagged ingredients
- `source` → shown under each ingredient, gives scientific credibility (Yuka does this, we match it)
- `hindi_verdict` → shown below the English verdict, accessibility for non-English users

---

## 11. UI Design Spec

### Color Palette (Dark Theme)
```
Background:        #0A0A0A
Card background:   #1A1A1A
Card border:       #2A2A2A
Primary text:      #FFFFFF
Secondary text:    #9CA3AF (gray-400)

Verdict SAFE:      #22C55E (green-500)
Verdict MODERATE:  #EAB308 (yellow-500)
Verdict CAUTION:   #EF4444 (red-500)

Accent blue:       #3B82F6
```

### Font
```
Font: Inter (Google Fonts)
Heading: font-bold text-2xl
Body: font-normal text-sm
```

### Screen Flow
```
[Home Page]
  → Big centered "Scan" button
  → Search by product name (text input)
  → Profile icon top right
  
[Scan Screen]
  → Camera view with scan frame
  → "Upload Image" button below
  → Back button
  
[Result Page]
  → Product name + brand
  → Product image (from OFFs or captured)
  → VERDICT CARD (big, colored, full width)
  → "For You" section (personalized note)
  → Ingredients list (translated)
  → Nutrition bars (4 metrics)
  → Indian context insight
  → "Scan Another" button
  
[Profile Page]
  → 7 checkboxes for health conditions
  → Save button (writes to localStorage)
```

---

## 12. Team Task Assignment

### Person 1 — Backend Lead
**Owns:** `backend/` folder entirely

**Tasks in order:**
1. `mkdir backend && cd backend && npm init -y`
2. `npm install express cors dotenv @google/generative-ai node-fetch`
3. Write `server.js` with CORS + 3 routes connected
4. Write `routes/barcode.js` — calls Open Food Facts API
5. Write `routes/image.js` — sends base64 image to Gemini Vision
6. Write `routes/analyze.js` — sends product data to Gemini for analysis
7. Write `utils/gemini.js` — the Gemini prompt wrapper
8. Test all routes with Postman or curl before handing to frontend

**Your .env file:**
```
GEMINI_API_KEY=your_key_here
PORT=3001
```

**Your .gitignore:**
```
node_modules/
.env
```

---

### Person 2 — Data + Logic + Database
**Owns:** `frontend/src/utils/verdictLogic.js` + Open Food Facts research + Neon PostgreSQL setup

**Tasks in order:**
1. Go to `neon.tech` → create free account → new project → copy DATABASE_URL → share with P1
2. Run `schema.sql` in Neon's SQL editor to create tables
3. Study Open Food Facts API response structure (test barcode `8901058155018` for Maggi)
4. Map OFFs field names to our data model
5. Write `verdictLogic.js` — the rule-based verdict calculator (no AI, just math)
6. Write the FSSAI threshold values as constants
7. Test verdict logic with 5 different products manually
8. Help P1 with the barcode route data mapping

**Database schema (run this in Neon SQL editor):**
```sql
CREATE TABLE scan_history (
  id          SERIAL PRIMARY KEY,
  session_id  VARCHAR(36)  NOT NULL,
  barcode     VARCHAR(50),
  product_name VARCHAR(255),
  brand       VARCHAR(255),
  verdict     VARCHAR(20)  NOT NULL,
  product_data JSONB,
  scanned_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_session_id ON scan_history(session_id);
```

**db/client.js:**
```js
import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
```

**Verdict logic skeleton:**
```js
export function calculateVerdict(nutriments, allergens, healthProfile) {
  const sugar = nutriments['sugars_100g'] || 0
  const sodium = nutriments['sodium_100g'] * 1000 || 0  // convert to mg
  const satFat = nutriments['saturated-fat_100g'] || 0

  // Check allergens first
  if (healthProfile.nutAllergy && allergens.includes('nuts')) return 'caution'
  if (healthProfile.glutenFree && allergens.includes('gluten')) return 'caution'

  // Diabetic profile
  if (healthProfile.diabetic && sugar > 15) return 'caution'

  // General thresholds (FSSAI-based)
  if (sugar > 30 || sodium > 800) return 'caution'
  if (sugar > 22.5 || sodium > 600 || satFat > 5) return 'moderation'

  return 'safe'
}
```

---

### Person 3 — Frontend Structure
**Owns:** `frontend/src/pages/` + routing + barcode scanner integration

**Tasks in order:**
1. `npm create vite@latest frontend -- --template react`
2. `cd frontend && npm install tailwindcss @tailwindcss/vite html5-qrcode axios react-router-dom`
3. Set up React Router with 3 routes: `/`, `/result`, `/profile`
4. Build `BarcodeScanner.jsx` using `html5-qrcode`
5. Build `ImageUploader.jsx` — file input + camera capture + base64 conversion
6. Build `Home.jsx` page layout (scan button + search input)
7. Wire up API calls in `utils/api.js`

**Barcode scanner component:**
```jsx
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 })
    scanner.render((result) => {
      scanner.clear()
      onScan(result)  // pass barcode string up to parent
    }, (err) => {})
    return () => scanner.clear()
  }, [])

  return <div id="reader" className="w-full" />
}
```

---

### Person 4 — UI Components + Styling
**Owns:** `frontend/src/components/` + all visual polish

**Tasks in order:**
1. Set up Tailwind dark theme in `tailwind.config.js` and `index.css`
2. Build `VerdictCard.jsx` — the hero component with colors
3. Build `IngredientPill.jsx` — individual ingredient with flag
4. Build `NutrientBar.jsx` — animated progress bar
5. Build `LoadingState.jsx` — skeleton loading with step indicators
6. Build `HealthProfileForm.jsx` — checkbox grid
7. Polish `Result.jsx` page layout end-to-end
8. Make sure it looks good on mobile screen (375px width minimum)

**Work with fake hardcoded data first. Don't wait for the API.**

---

### Person 5 — Gemini API + PWA + Deployment
**Owns:** Gemini key, PWA config, GitHub, Vercel, Render

**Tasks in order:**
1. RIGHT NOW: Go to `aistudio.google.com`, get free Gemini API key, share in WhatsApp
2. Create GitHub repo, add all team members as collaborators
3. Everyone clones the same repo from minute one
4. Configure PWA: install `vite-plugin-pwa`, write `manifest.json`
5. Set up Vercel account (free), connect GitHub repo
6. Set up Render account (free), deploy backend
7. Set `GEMINI_API_KEY` as environment variable on Render
8. Set `VITE_BACKEND_URL` as environment variable on Vercel
9. Be the "connector" — unblock anyone who is stuck

**PWA manifest.json:**
```json
{
  "name": "NutriScan",
  "short_name": "NutriScan",
  "description": "Scan food. Understand it. Decide it.",
  "theme_color": "#0A0A0A",
  "background_color": "#0A0A0A",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 13. Hour-by-Hour Build Plan

```
Hour 0–1   SETUP
           P5: GitHub repo created, all cloned, Gemini key shared
           P1: backend folder + npm install done, server.js with /health route running
           P3: frontend folder + npm install done, React app loads in browser
           P4: Tailwind configured, dark background showing

Hour 1–3   CORE LOOP (ugly but working)
           P1: barcode route calling Open Food Facts and returning data
           P2: verdict logic file written and tested
           P3: BarcodeScanner component opening camera
           P4: VerdictCard built with hardcoded fake data

Hour 3–6   CONNECT EVERYTHING
           P1: image route + Gemini analyze route both working
           P3: frontend calling backend barcode route, showing raw data
           P2: verdict logic integrated into result flow
           P4: Result page showing real verdict card from API data

Hour 6–9   FULL FEATURE COMPLETE
           P3: image scan working end-to-end
           P5: health profile in localStorage changing verdict
           P4: ingredient translator showing explained ingredients
           P1: all edge cases handled (product not found, API timeout)

Hour 9–12  UI POLISH (most important phase)
           P3+P4: Result page looks premium on mobile
           P4: Loading state with step animation
           P5: PWA configured, app installable on phone
           P2: Indian context insight showing correctly

Hour 12–14 TEST ON REAL DEVICES
           All 5 members open live Vercel URL on phone
           Scan 5 real products: Maggi, Lay's, Parle-G, Amul Butter, Real Fruit Juice
           Fix what breaks. Only bug fixes, no new features.

Hour 14–15 DEPLOY + DEMO PREP
           P5: final deploy to Vercel + Render, confirm live URL works
           Everyone: practice demo script 3 times
           Prepare what to say for each evaluation round

Hour 15–16 BUFFER / REST
           Do NOT add features. Sleep if possible.
           Have demo script memorized.
```

---

## 14. Demo Script (Practice This Exactly)

### What you say (30 seconds):
> "Every day, millions of Indians pick up a packet in D-Mart and have no idea if it's safe for them. The label is in English, full of INS codes, and doesn't tell a diabetic whether they should eat it. NutriScan fixes this. Watch."

### What you do (live demo — 90 seconds):
1. Open the app on phone — show the clean home screen
2. Click "Scan Barcode" — point at a Maggi packet
3. Result loads: "Eat in Moderation" yellow card, high sodium reason
4. Show Hindi verdict below the card — "सीमित मात्रा में खाएं"
5. Show "For Diabetics: Avoid daily" — profile personalization working
6. Scroll to Label Report: "🟡 Not Clean — 2 concerns" header
7. Tap INS 635 — shows plain name + explanation + "Source: WHO Food Additives"
8. Show "Try Instead" card — Sunfeast alternative with why it's better
9. Click "Scan Another" → scan a Parle-G biscuit
10. Show Indian context: "Common chai-time snack — okay occasionally"

**Total demo time: under 2 minutes.** Leave 3 minutes for judge questions.

---

## 15. Judge Questions — Prepared Answers

| Question | Answer |
|----------|--------|
| What is your data source? | Open Food Facts — 3 million products, same database used by Yuka and 100+ real apps worldwide |
| What if Indian product isn't in database? | Gemini Vision reads the product image directly — no database needed. We showed this with the image scan feature |
| How is this different from Yuka? | Three ways: Yuka gives a score out of 100 — we give a plain-language decision. Yuka's personalization costs ₹800/year — ours is free. Yuka has no Indian food context — we do. |
| How is this different from Read the Labels? | Read the Labels only shows clean/not clean with no explanation of why. We show exactly which ingredient is the problem, what it is in plain English, and what science says about it. Plus we suggest a better alternative. |
| Can it scale? | Open Food Facts scales to millions. Gemini API scales with usage. Frontend is static on Vercel — infinite scale at zero cost |
| Is the verdict medically accurate? | Thresholds are based on FSSAI daily recommended values, the same standards used on Indian food labels. We show a disclaimer for medical decisions. |
| What about scanned/handwritten labels? | Current version handles digital barcodes and front-of-pack images. Label OCR is a planned enhancement. |
| Why PWA and not an app? | PWA works on every phone instantly via link — no installation. Judges can scan our QR code right now and use it on their own phone. |

---

## 16. Definition of Done

The app is done when:
- [ ] Barcode scan works on a real phone (test with Maggi: `8901058155018`)
- [ ] Image scan identifies a product correctly
- [ ] Verdict card shows correct color for safe/moderate/caution
- [ ] Health profile changes the verdict output
- [ ] Label Report shows "Clean / Not Clean" header with concern count
- [ ] Each ingredient shows plain name + source citation
- [ ] "Try Instead" alternative product card appears for Moderation/Caution products
- [ ] Hindi verdict line shows below English verdict
- [ ] App loads on mobile via Vercel URL without installation
- [ ] All 5 team members have demoed it successfully on their phone

---

## 17. Emergency Decisions

If something breaks and you have < 2 hours left, drop features in this order:

1. Drop image scan → barcode only is enough
2. Drop Gemini ingredient translation → show raw ingredient list
3. Drop health profile personalization → show generic verdict only
4. Drop Indian context → remove the field from UI

**Core that must work no matter what:** barcode scan → verdict card.
That is the minimum viable demo. Everything else is bonus.

---

*PRD Version 1.0 | HackHorizon 2K26 | NutriScan Team*
