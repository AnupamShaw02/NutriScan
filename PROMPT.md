# Master Build Prompt — NutriScan
## Paste this entire prompt into a new Claude conversation to start building

---

You are a senior full-stack engineer helping a 5-person team build **NutriScan** at a 24-hour hackathon called HackHorizon 2K26. You will build this app step by step, one file at a time, and wait for confirmation before moving to the next step.

Read both specification files carefully before writing any code:
- `PRD.md` — full product requirements, tech stack, API routes, Gemini prompt, team tasks
- `SCREENS.md` — screen-by-screen design spec with exact colors, typography, animations, and CSS

---

## Your Constraints (Never Break These)

1. **No TypeScript** — plain JavaScript only. Team has no TS experience.
2. **No unnecessary packages** — only install what is listed in PRD.md Section 7.
3. **Build one file at a time** — complete each file fully before moving to the next.
4. **Always ask before proceeding** to the next phase.
5. **Mobile-first** — every component must look correct at 375px width minimum.
6. **Dark theme only** — use exact color tokens from SCREENS.md Design System section. No light mode.
7. **No TypeScript types, no PropTypes, no JSDoc** — keep code clean and minimal.
8. **Never use `any` workarounds or TODO comments** — write complete working code.
9. **The Gemini prompt in PRD.md Section 10 is sacred** — do not modify it.

---

## Stack (Exact Versions)

```
Frontend:  React + Vite, Tailwind CSS, React Router v6, html5-qrcode, axios
Backend:   Node.js + Express, @google/generative-ai, pg, node-fetch, cors, dotenv, multer
Database:  Neon PostgreSQL (connection via DATABASE_URL env var)
AI:        Gemini 1.5 Flash (free, via @google/generative-ai SDK)
Food API:  Open Food Facts (no key needed)
Deploy:    Vercel (frontend) + Render (backend) + Neon (database)
```

---

## Build Order — Follow This Exactly

### PHASE 1 — Backend Foundation
Build in this order, one file at a time:

**Step 1.1** — `backend/package.json` and install command
**Step 1.2** — `backend/.gitignore`
**Step 1.3** — `backend/.env.example` (template, no real keys)
**Step 1.4** — `backend/db/client.js` (Neon pg Pool connection)
**Step 1.5** — `backend/db/schema.sql` (scan_history table from PRD Section 12 Person 2)
**Step 1.6** — `backend/utils/gemini.js` (Gemini API wrapper with exact prompt from PRD Section 10)
**Step 1.7** — `backend/routes/barcode.js` (calls Open Food Facts + Gemini + alternative product)
**Step 1.8** — `backend/routes/image.js` (Gemini Vision for image scan)
**Step 1.9** — `backend/routes/analyze.js`
**Step 1.10** — `backend/server.js` (Express entry point, CORS, all routes mounted)

After Step 1.10, pause and say: "Phase 1 complete. Test with: curl http://localhost:3001/api/health"

---

### PHASE 2 — Frontend Foundation
**Step 2.1** — Vite + React setup command (exact npm command to run)
**Step 2.2** — `frontend/tailwind.config.js` (full config from SCREENS.md Tailwind section)
**Step 2.3** — `frontend/src/index.css` (from SCREENS.md Global Styles section)
**Step 2.4** — `frontend/src/utils/api.js` (all axios calls to backend)
**Step 2.5** — `frontend/src/utils/verdictLogic.js` (rule-based logic from PRD Section 12 Person 2)
**Step 2.6** — `frontend/src/App.jsx` (React Router setup, 4 routes)

After Step 2.6, pause and say: "Phase 2 complete. Run: npm run dev and confirm app loads."

---

### PHASE 3 — Components (Build with hardcoded fake data, no API calls yet)
**Step 3.1** — `frontend/src/components/VerdictCard.jsx`
  - Props: `verdict` ("safe"|"moderation"|"caution"), `headline`, `hindiVerdict`, `profileNote`
  - Exact colors from SCREENS.md Design System
  - Enter animation: translateY(32px)→0, 500ms ease-out
  - Glow shadow variant per verdict

**Step 3.2** — `frontend/src/components/NutrientBar.jsx`
  - Props: `label`, `value`, `unit`, `level` ("low"|"medium"|"high"|"very-high"), `delay`
  - Animated fill from scaleX(0) to scaleX(1) on mount
  - Bar color changes by level

**Step 3.3** — `frontend/src/components/IngredientPill.jsx`
  - Props: `name`, `plainName`, `explanation`, `flag`, `source`
  - Collapsed: 44px, shows name + flag dot
  - Expanded on tap: shows plainName bold, explanation, source in monospace caption
  - Height transition: max-height 44px→130px, 250ms ease-out
  - Source line: JetBrains Mono font, Caption size, --text-disabled color

**Step 3.4** — `frontend/src/components/AlternativeCard.jsx`
  - Props: `name`, `brand`, `imageUrl`, `whyBetter` (array of strings)
  - Only renders if alternative.found === true AND verdict !== "safe"
  - "Try Instead" label + product card with chevron →

**Step 3.5** — `frontend/src/components/LoadingState.jsx`
  - 3 steps that appear one-by-one with staggered timing (0ms, 800ms, 1600ms)
  - Skeleton shimmer preview below steps
  - Exact shimmer CSS from SCREENS.md Processing screen section

**Step 3.6** — `frontend/src/components/BarcodeScanner.jsx`
  - Wraps html5-qrcode
  - Full-screen camera view with scan line animation and corner markers
  - Exact CSS from SCREENS.md Scanner screen section
  - Calls onScan(barcodeString) on success + navigator.vibrate(50)

**Step 3.7** — `frontend/src/components/ImageUploader.jsx`
  - File input + camera capture
  - Converts to base64 before passing up
  - Shows thumbnail preview of selected image

**Step 3.8** — `frontend/src/components/HealthProfileForm.jsx`
  - 7 conditions in 3 groups (Dietary Restrictions, Health Conditions, Goals)
  - Saves to localStorage on "Save Profile"
  - Spring-animated checkmark (pop keyframe from SCREENS.md)

After Step 3.8, pause. Say: "Phase 3 complete. All components built. Confirm each renders correctly with hardcoded props before Phase 4."

---

### PHASE 4 — Pages (Wire everything together with real API calls)
**Step 4.1** — `frontend/src/pages/Home.jsx`
  - Dot grid background (CSS from SCREENS.md)
  - Radial ambient indigo glow
  - Scan button (56px, full width, indigo)
  - Search text input
  - Recent scans horizontal scroll (reads from localStorage scan history)
  - Staggered entrance animations on load

**Step 4.2** — `frontend/src/pages/Profile.jsx`
  - Uses HealthProfileForm component
  - Reads/writes localStorage key `nutriscan_profile`

**Step 4.3** — `frontend/src/pages/Result.jsx`
  - Assembles all components in exact order from SCREENS.md Result screen layout:
    1. Product image + name + brand row
    2. VerdictCard (with hindi_verdict)
    3. "For You" profile note card (only if profile_note exists)
    4. AlternativeCard ("Try Instead" — only if verdict !== safe)
    5. Nutrition section with 4 NutrientBars
    6. Label Report section header with "🟡 Not Clean — X concerns" badge
    7. List of IngredientPills
    8. Indian Context card (indigo tint)
    9. "Scan Another" outlined button
    10. Disclaimer caption
  - Reads result from React Router location.state (passed from scan)
  - Saves scan to localStorage history on mount

**Step 4.4** — `frontend/src/pages/Scanner.jsx`
  - Shows BarcodeScanner by default
  - Toggle to ImageUploader on "Take a Photo" button
  - On barcode scan: POST /api/scan/barcode → navigate to /result with state
  - On image: POST /api/scan/image → navigate to /result with state
  - Shows LoadingState during API call
  - On barcode not found (found: false): navigate to /not-found

**Step 4.5** — `frontend/src/pages/NotFound.jsx`
  - "Product not in database" error state from SCREENS.md Screen 6
  - Two buttons: "Scan Package Label" (switch to image mode) and "Enter Manually"

**Step 4.6** — `frontend/src/pages/Search.jsx`
  - Search input + results list
  - Calls Open Food Facts search API: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=1`
  - Shows product rows with image, name, brand
  - Clicking a row: POST /api/scan/barcode with that product's barcode → /result

After Step 4.6, pause. Say: "Phase 4 complete. Full app connected. Test the barcode: 8901058155018 (Maggi)"

---

### PHASE 5 — PWA + Deploy
**Step 5.1** — `frontend/public/manifest.json` (from PRD Section 12 Person 5)
**Step 5.2** — `frontend/vite.config.js` with vite-plugin-pwa configured
**Step 5.3** — Vercel deploy instructions (exact steps)
**Step 5.4** — Render deploy instructions (exact steps + env vars to set)
**Step 5.5** — Neon setup instructions (create project, run schema.sql, get DATABASE_URL)

---

## Critical Implementation Details

### Open Food Facts barcode call
```js
const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
const res = await fetch(url)
const data = await res.json()
if (data.status === 0) return { found: false }
```

### Open Food Facts alternative product call
```js
// After getting main product's category tag:
const category = product.categories_tags?.[0] || ''
const altUrl = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&sort_by=nutriscore_score&page_size=5&json=1`
```

### Gemini Vision call (image scan)
```js
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const result = await model.generateContent([
  { inlineData: { mimeType: 'image/jpeg', data: base64WithoutPrefix } },
  'Extract all text from this food product label. Return only the raw text.'
])
// Then pass extracted text to the analyze route
```

### JSON extraction from Gemini (always do this — Gemini sometimes wraps JSON)
```js
function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in Gemini response')
  return JSON.parse(match[0])
}
```

### localStorage keys
```
nutriscan_profile    → health profile object
nutriscan_history    → array of last 10 scan results (push new, slice to 10)
nutriscan_session    → UUID session ID (generate once with crypto.randomUUID())
```

### CORS in server.js
```js
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}))
```

---

## What The Gemini Response Looks Like (Use This for Fake Data in Phase 3)

```js
const FAKE_RESULT = {
  product: {
    name: "Maggi 2-Minute Masala Noodles",
    brand: "Nestlé India",
    weight: "70g",
    image_url: "https://images.openfoodfacts.org/images/products/890/105/815/5018/front_en.jpg",
    nutriments: { calories_100g: 387, sugars_100g: 4.6, sodium_100g: 0.91, protein_100g: 8 }
  },
  analysis: {
    verdict: "moderation",
    verdict_headline: "High sodium, refined flour — okay once a week",
    label_clean: false,
    label_concerns_count: 2,
    profile_note: "Avoid daily if diabetic — contains refined flour",
    hindi_verdict: "सीमित मात्रा में खाएं",
    ingredients_explained: [
      { name: "Wheat Flour", plain_name: "Wheat Flour", explanation: "Main ingredient, refined grain", flag: "ok", source: "FSSAI approved" },
      { name: "INS 508", plain_name: "Potassium Chloride", explanation: "Salt substitute, safe in moderation", flag: "warning", source: "EFSA 2019" },
      { name: "INS 635", plain_name: "Disodium Ribonucleotides", explanation: "Flavour enhancer, avoid if gout-prone", flag: "warning", source: "WHO Food Additives" }
    ],
    nutrition_levels: { calories: "high", sugar: "low", sodium: "very-high", protein: "medium" },
    indian_context: "Common chai-time snack — okay occasionally but not a daily option"
  },
  alternative: {
    found: true,
    name: "Sunfeast Farmlite Digestive",
    brand: "ITC",
    image_url: "",
    why_better: ["Lower sodium", "More protein"]
  }
}
```

---

## Hardcoded Test Barcodes

| Product | Barcode |
|---------|---------|
| Maggi Masala Noodles | 8901058155018 |
| Parle-G Biscuits | 8901019100025 |
| Lay's Classic Salted | 8901491106315 |
| Amul Butter | 8901057000065 |
| Real Fruit Juice Orange | 8906002231164 |

Test all 5 before the demo. These must work perfectly.

---

## If Something Breaks — Fallback Order

1. Gemini returns invalid JSON → use `extractJSON()` helper, if still fails → return hardcoded FAKE_RESULT
2. Open Food Facts returns nothing → `found: false` → redirect to /not-found
3. Image scan fails → show "Try barcode scan instead" message
4. Alternative product not found → `alternative.found: false` → AlternativeCard renders nothing
5. Camera permission denied → show file upload fallback automatically

---

## Start Now

Begin with **Phase 1, Step 1.1**.

Write the complete `backend/package.json` file and give me the exact `npm install` command to run. Do not write any other files yet.

After I confirm it works, move to Step 1.2.
