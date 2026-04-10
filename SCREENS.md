# NutriScan — Screen-by-Screen Design Specification
## Visual Design, Typography, Animations, Psychology

> Design reference: Linear.app + Vercel.com + Arc Browser
> This document defines exactly how every screen looks, feels, and behaves.

---

## Design System (Read This First)

### Color Tokens
```
/* Background layers — use these, never raw black */
--bg-base:      #080808   /* page background */
--bg-surface:   #111111   /* cards */
--bg-elevated:  #1A1A1A   /* hover, active states */
--bg-overlay:   #222222   /* modals, drawers */

/* Borders */
--border-subtle:  #1C1C1C  /* barely visible — separators */
--border-default: #2A2A2A  /* cards, inputs */
--border-strong:  #3D3D3D  /* focused inputs */

/* Text */
--text-primary:   #F4F4F5  /* headlines */
--text-secondary: #A1A1AA  /* body, labels — zinc-400 */
--text-tertiary:  #71717A  /* placeholders — zinc-500 */
--text-disabled:  #3F3F46  /* zinc-700 */

/* Semantic — verdict colors */
--safe-bg:        rgba(22, 163, 74, 0.10)   /* green tint */
--safe-border:    rgba(34, 197, 94, 0.25)
--safe-text:      #4ADE80                   /* green-400 */
--safe-solid:     #16A34A

--moderate-bg:    rgba(202, 138, 4, 0.10)
--moderate-border: rgba(234, 179, 8, 0.25)
--moderate-text:  #FACC15                   /* yellow-400 */
--moderate-solid: #CA8A04

--caution-bg:     rgba(220, 38, 38, 0.10)
--caution-border: rgba(239, 68, 68, 0.25)
--caution-text:   #F87171                   /* red-400 */
--caution-solid:  #DC2626

/* Accent — for CTAs and interactive elements */
--accent:         #6366F1  /* indigo-500 */
--accent-hover:   #4F46E5  /* indigo-600 */
--accent-glow:    rgba(99, 102, 241, 0.20)
--accent-subtle:  rgba(99, 102, 241, 0.08)
```

### Typography Scale
```
Font: "Inter", system-ui, -apple-system, sans-serif
Import: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap

Scale:
  Display:   48px  / weight 800 / tracking -0.03em / line-height 1.1
  H1:        32px  / weight 700 / tracking -0.02em / line-height 1.2
  H2:        24px  / weight 600 / tracking -0.01em / line-height 1.3
  H3:        18px  / weight 600 / tracking  0      / line-height 1.4
  H4:        15px  / weight 600 / tracking  0      / line-height 1.4
  Body:      14px  / weight 400 / tracking  0      / line-height 1.6
  Small:     13px  / weight 400 / tracking  0      / line-height 1.5
  Caption:   11px  / weight 500 / tracking +0.06em / line-height 1.4 / UPPERCASE
  Mono:      13px  / font: "JetBrains Mono", monospace / weight 400
```

### Spacing System (base 4px)
```
4px   xs
8px   sm
12px  md-sm
16px  md
20px  md-lg
24px  lg
32px  xl
40px  2xl
48px  3xl
64px  4xl
```

### Motion Tokens
```
Duration:
  instant:  100ms
  fast:     150ms
  normal:   250ms
  slow:     400ms
  veryslow: 600ms

Easing:
  ease-out:    cubic-bezier(0.16, 1, 0.3, 1)    /* spring-like, natural */
  ease-in:     cubic-bezier(0.4, 0, 1, 1)
  ease-inout:  cubic-bezier(0.65, 0, 0.35, 1)
  spring:      cubic-bezier(0.34, 1.56, 0.64, 1) /* slight overshoot */

Rules:
  - Entrance: always ease-out
  - Exit: always ease-in, faster than entrance
  - Never use linear for UI transitions
  - Stagger list items: 40ms between each item
```

### Border Radius
```
none:   0
sm:     6px    /* tags, badges */
md:     10px   /* inputs, buttons */
lg:     14px   /* cards */
xl:     20px   /* large cards, verdict card */
full:   9999px /* pills, avatars */
```

### Shadows
```
/* Use sparingly — only on elevated surfaces */
shadow-sm:  0 1px 2px rgba(0,0,0,0.4)
shadow-md:  0 4px 12px rgba(0,0,0,0.5)
shadow-lg:  0 8px 32px rgba(0,0,0,0.6)
glow-safe:  0 0 24px rgba(34, 197, 94, 0.15)
glow-mod:   0 0 24px rgba(234, 179, 8, 0.15)
glow-caut:  0 0 24px rgba(239, 68, 68, 0.15)
```

---

## Screen 1 — Home Screen (/)

### Purpose
First impression. Communicates the product in under 3 seconds. Primary CTA is the scan button.

### Psychological Principles Applied
- **Fitts's Law:** Scan button is the largest tappable element — 64px tall, full width minus padding
- **Von Restorff Effect:** Scan button in accent indigo stands out against dark background — everything else is muted
- **Cognitive load reduction:** Minimal text. User only sees ONE action to take.
- **Social proof subtle signal:** "Based on FSSAI guidelines" in micro text builds credibility without noise

### Layout (Mobile — 390px wide)

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  ·  ·  ·  (subtle dot grid bg) │  ← radial gradient dots, 24px gap, opacity 0.04
│                                 │
│  [top 20px safe area]           │
│                                 │
│  NutriScan           [⚙ icon]  │  ← H4, --text-primary / icon 20px, --text-tertiary
│  ─────────────────────────────  │  ← border-subtle, 1px
│                                 │
│                                 │
│     [radial glow — indigo]      │  ← position: absolute, 300px circle, opacity 0.06
│                                 │
│   Scan food.                    │  ← Display, --text-primary
│   Know what's                   │
│   in it.                        │
│                                 │
│   Instant verdict for every     │  ← Body, --text-secondary, max-width 260px
│   Indian consumer. Free.        │
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │  [scan icon 18px]       │    │  ← Button: bg #6366F1, border-radius 12px
│  │  Scan a Product         │    │     height 56px, full width, font H4
│  └─────────────────────────┘    │     hover: bg #4F46E5 + slight scale(1.01)
│                                 │     active: scale(0.98)
│                                 │
│  ── or search by name ──────── │  ← Caption, --text-disabled, horizontal line
│                                 │
│  ┌─────────────────────────┐    │
│  │  🔍  Search products... │    │  ← bg: --bg-surface, border: --border-default
│  └─────────────────────────┘    │     height 48px, border-radius 10px
│                                 │     font: Body, placeholder: --text-tertiary
│                                 │
│                                 │
│  Recent Scans                   │  ← H4, --text-secondary
│                                 │
│  ┌───────────┐ ┌───────────┐    │
│  │ [img]     │ │ [img]     │    │  ← horizontal scroll, 2.5 cards visible
│  │ Maggi     │ │ Parle-G   │    │     card: 140px wide, bg --bg-surface
│  │ 🟡 Mod.   │ │ 🟢 Safe   │    │     border-radius 14px, border --border-subtle
│  └───────────┘ └───────────┘    │
│                                 │
│  [bottom safe area 20px]        │
└─────────────────────────────────┘
```

### Component Details

**Logo/Wordmark — top left:**
- Text: "NutriScan"
- Font: H4, weight 600
- Color: --text-primary
- No logo image — wordmark only (faster, cleaner)

**Background dot grid:**
```css
background-image: radial-gradient(circle, #ffffff08 1px, transparent 1px);
background-size: 24px 24px;
```

**Radial ambient glow (behind headline):**
```css
position: absolute;
width: 320px; height: 320px;
background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
top: 120px; left: 50%; transform: translateX(-50%);
pointer-events: none;
```

**Scan Button:**
```css
background: #6366F1;
height: 56px;
border-radius: 12px;
font-size: 15px; font-weight: 600;
color: white;
transition: transform 150ms cubic-bezier(0.16,1,0.3,1),
            background 150ms ease;
```

**Recent Scan Cards (horizontal scroll):**
```css
display: flex; gap: 12px;
overflow-x: auto; padding-bottom: 8px;
scrollbar-width: none; /* hide scrollbar */

.card {
  min-width: 140px; height: 160px;
  background: #111111;
  border: 1px solid #1C1C1C;
  border-radius: 14px;
  padding: 12px;
}
```

### Animations on Load
1. Dot grid fades in: `opacity 0 → 1`, 600ms, ease-out
2. Headline slides up: `translateY(16px) → translateY(0)`, 400ms, 100ms delay
3. Subtext fades in: 400ms, 200ms delay
4. Button slides up: 400ms, 300ms delay
5. Search bar slides up: 400ms, 350ms delay
6. Recent cards slide up staggered: 300ms each, 40ms stagger

---

## Screen 2 — Profile Setup (/profile)

### Purpose
First-time only. User picks their health conditions. Stored in localStorage. Shown once — after that, accessible via settings icon.

### Psychological Principles Applied
- **Commitment & Consistency:** Once user makes a choice here, they're committed. This increases perceived value of results.
- **Endowment Effect:** "Tell us about you" framing makes the app feel personalized before any scan happens
- **Chunking:** Conditions split into 3 visual groups so it doesn't overwhelm
- **Progress indicator:** Onboarding step "1 of 1" — single step, no friction

### Layout

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  ← Back                         │  ← Caption, --text-tertiary
│                                 │
│  Your Health Profile            │  ← H1, --text-primary
│  We personalize every scan      │  ← Body, --text-secondary
│  based on this.                 │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  DIETARY RESTRICTIONS           │  ← Caption, --text-disabled, letter-spacing wide
│                                 │
│  ┌─────────────────────────┐    │
│  │  🌱  Vegan              │ ✓ │  ← card row, bg --bg-surface
│  ├─────────────────────────┤    │     when selected: bg --bg-elevated
│  │  🌾  Gluten Intolerant  │   │     border: --border-subtle → --border-strong
│  ├─────────────────────────┤    │     border-radius 12px on group
│  │  🥛  Lactose Intolerant │   │
│  └─────────────────────────┘    │
│                                 │
│  HEALTH CONDITIONS              │  ← Caption, --text-disabled
│                                 │
│  ┌─────────────────────────┐    │
│  │  💉  Diabetic           │ ✓ │
│  ├─────────────────────────┤    │
│  │  ❤️   Heart Patient      │   │
│  └─────────────────────────┘    │
│                                 │
│  GOALS                          │  ← Caption, --text-disabled
│                                 │
│  ┌─────────────────────────┐    │
│  │  ⚖️   Weight Loss        │   │
│  ├─────────────────────────┤    │
│  │  💪  Muscle Gain        │ ✓ │
│  ├─────────────────────────┤    │
│  │  🥜  Nut Allergy        │   │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Save Profile           │    │  ← same style as scan button, indigo
│  └─────────────────────────┘    │
│                                 │
│  You can update this anytime    │  ← Caption, --text-disabled, centered
│  in settings.                   │
│                                 │
└─────────────────────────────────┘
```

### Component Details

**Row Item:**
```css
.profile-row {
  display: flex; align-items: center;
  padding: 14px 16px;
  background: #111111;
  border-bottom: 1px solid #1C1C1C;
  cursor: pointer;
  transition: background 150ms ease;
}
.profile-row:hover { background: #1A1A1A; }
.profile-row.selected {
  background: rgba(99,102,241,0.08);
}
```

**Checkmark (selected state):**
```css
.checkmark {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #6366F1;
  display: flex; align-items: center; justify-content: center;
  /* animate in with spring scale */
  animation: pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
```

---

## Screen 3 — Scanner (/scan)

### Purpose
Open camera, scan barcode or take photo. Focused, distraction-free. The camera IS the screen.

### Psychological Principles Applied
- **Flow state:** Full-screen camera removes all distractions
- **Feedback loop:** Live scan line animation creates perception of "working"
- **Clear affordance:** "Point at barcode" text tells user exactly what to do

### Layout

```
┌─────────────────────────────────┐  ← bg: #000000 (true black — camera bg)
│                                 │
│  ← Cancel                       │  ← Caption, white, top-left, safe area
│                                 │
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │  ← Camera viewfinder — full width - 40px
│  │   ┌─────────────────┐   │    │     aspect ratio 1:1
│  │   │                 │   │    │
│  │   │   [scan area]   │   │    │  ← Corner markers: 20px L-shapes, white
│  │   │                 │   │    │     opacity 0.8
│  │   │   ─────────     │   │    │  ← Scan line: 2px, red-to-transparent gradient
│  │   │                 │   │    │     animates top→bottom, 1.5s loop
│  │   └─────────────────┘   │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Point camera at barcode        │  ← Body, white, centered
│                                 │
│  ─── or ───────────────────    │  ← Caption, rgba(255,255,255,0.3)
│                                 │
│  ┌─────────────────────────┐    │
│  │  📷  Take a Photo       │    │  ← bg: rgba(255,255,255,0.1)
│  └─────────────────────────┘    │     border: rgba(255,255,255,0.15)
│                                 │     backdrop-filter: blur(12px)
│                                 │     border-radius: 12px
└─────────────────────────────────┘
```

### Scan Line Animation
```css
.scan-line {
  position: absolute;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #EF4444, transparent);
  animation: scan 1.5s ease-in-out infinite;
}

@keyframes scan {
  0%   { top: 0%;   opacity: 1; }
  45%  { top: 100%; opacity: 1; }
  50%  { top: 100%; opacity: 0; }
  55%  { top: 0%;   opacity: 0; }
  60%  { top: 0%;   opacity: 1; }
  100% { top: 100%; opacity: 1; }
}
```

### Corner Markers
```css
.corner { position: absolute; width: 20px; height: 20px; }
.corner-tl { top: 0;    left: 0;  border-top: 2px solid white; border-left: 2px solid white; }
.corner-tr { top: 0;    right: 0; border-top: 2px solid white; border-right: 2px solid white; }
.corner-bl { bottom: 0; left: 0;  border-bottom: 2px solid white; border-left: 2px solid white; }
.corner-br { bottom: 0; right: 0; border-bottom: 2px solid white; border-right: 2px solid white; }
```

### On Successful Scan
- Haptic feedback (if available): `navigator.vibrate(50)`
- Scanner frame flashes white briefly: `opacity 1 → 0`, 200ms
- Auto-navigate to Processing screen

---

## Screen 4 — Processing Screen (/processing)

### Purpose
Show user the app is "thinking." Make the wait feel productive, not empty.

### Psychological Principles Applied
- **Doherty Threshold:** Response within 400ms feels instant. Anything longer needs feedback — this screen provides it.
- **Progress illusion:** Showing steps one by one makes 3-5 seconds feel like progress, not waiting
- **Anticipation:** Skeleton of result screen appears below, previewing what's coming

### Layout

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  [top safe area]                │
│                                 │
│  Analysing your product…        │  ← H3, --text-primary
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │  ← bg: --bg-surface, border: --border-subtle
│  │  ✓  Barcode recognised  │    │     border-radius: 14px, padding: 20px
│  │                         │    │
│  │  ✓  Product found       │    │  ← steps appear one by one with fade+slide
│  │                         │    │     completed: ✓ green circle, --text-secondary
│  │  ○  Reading ingredients │    │     active: ○ pulsing indigo dot, --text-primary
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Usually takes 3–5 seconds      │  ← Caption, --text-disabled, centered
│                                 │
│                                 │
│  ── Preview ───────────────── │  ← Caption, --text-disabled
│                                 │
│  ┌─────────────────────────┐    │  ← Skeleton of result card
│  │  ████████████  ██████   │    │     animated shimmer effect
│  │                         │    │     bg: --bg-surface
│  │  ┌───────────────────┐  │    │
│  │  │  ██████████████   │  │    │
│  │  │  ████████         │  │    │
│  │  └───────────────────┘  │    │
│  │  ████████  ████  ██████ │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Skeleton Shimmer
```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #1A1A1A 25%,
    #2A2A2A 37%,
    #1A1A1A 63%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}
```

### Step Animation (staggered reveal)
```
Step 1 appears at: 0ms
Step 2 appears at: 800ms
Step 3 appears at: 1600ms
Each step: translateY(8px)→0 + opacity 0→1, 300ms ease-out
Step becomes "done": icon swaps from ○ to ✓ with pop animation
```

---

## Screen 5 — Result Screen (/result)

### Purpose
**The most important screen.** This is what judges photograph. This is what users remember.

### Psychological Principles Applied
- **Anchoring:** Verdict card is the FIRST and LARGEST element. User anchors their entire understanding to this color.
- **Hierarchy of information:** Verdict → Why → Hindi translation → Personal note → Better alternative → Details. Most important first.
- **Loss aversion framing:** Show nutrient bars as % of daily limit ("82% of your sodium today") — more motivating than raw grams
- **Authority markers:** "Per FSSAI DRV" + source citations on each ingredient = double credibility signal
- **F-pattern reading:** Product name top-left, verdict below, key info in left-aligned list
- **Color psychology:** Green = safe = go, Yellow = caution = slow down, Red = danger = stop
- **Reciprocity:** "Try Instead" card gives user something useful after showing them something bad — keeps engagement positive
- **Social proof via science:** "Source: EFSA 2019" on each additive — Yuka does this, it builds trust immediately
- **Audit framing (Read the Labels):** "Label Report" header + "🟡 Not Clean" language makes it feel like an official assessment, not an opinion
- **Completion satisfaction:** Scroll reaches a clear end with "Scan Another" CTA — closure

### Layout

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  ← Back           [share icon]  │  ← Caption + 20px icon, --text-tertiary
│                                 │
│  ┌─────────────────────────┐    │  ← product image + info row
│  │  [120x120 product img]  │    │     bg: --bg-surface, border-radius 14px
│  │                         │    │     padding 16px, display: flex
│  │  Maggi Masala Noodles   │    │  ← H3, --text-primary
│  │  Nestlé India • 70g     │    │  ← Small, --text-tertiary
│  └─────────────────────────┘    │
│                                 │
│                                 │
│  ╔═════════════════════════╗    │  ← VERDICT CARD — most prominent element
│  ║                         ║    │     SAFE:     bg --safe-bg, border --safe-border
│  ║   ●  EAT IN             ║    │     MODERATE: bg --moderate-bg, border --moderate-border
│  ║      MODERATION         ║    │     CAUTION:  bg --caution-bg, border --caution-border
│  ║                         ║    │
│  ║  High sodium + refined  ║    │  ← verdict_headline, Body, verdict text color
│  ║  flour. Okay once a     ║    │
│  ║  week.                  ║    │
│  ║                         ║    │
│  ║  सीमित मात्रा में खाएं   ║    │  ← hindi_verdict, Small, opacity 0.7, same color
│  ║                         ║    │     font-weight 400, font-style normal
│  ╚═════════════════════════╝    │  ← border-radius 20px, padding 24px
│                                 │     box-shadow: glow variant
│                                 │
│  For You  ────────────────────  │  ← H4, --text-primary + --border-subtle line
│                                 │
│  ┌─────────────────────────┐    │  ← if profile has conditions
│  │ 💉 Diabetic             │    │     bg: rgba(239,68,68,0.06)
│  │ Avoid daily — high sugar│    │     border: --caution-border
│  └─────────────────────────┘    │     border-radius 10px, padding 14px
│                                 │
│                                 │
│  Try Instead  ─────────────── │  ← H4, --text-primary (only shown if verdict ≠ safe)
│                                 │
│  ┌─────────────────────────┐    │  ← "Better Alternative" card
│  │ [48px img] Sunfeast     │  →│     bg: --bg-surface, border: --border-subtle
│  │            Farmlite     │    │     border-radius: 12px, padding: 14px
│  │            Digestive    │    │     display: flex, align-items: center
│  │  ✓ Lower sodium         │    │  ← Small, --safe-text
│  │  ✓ More protein         │    │
│  └─────────────────────────┘    │
│                                 │
│  Yuka charges ₹800/year for     │  ← DO NOT show this text in UI, just in doc
│  this feature. We do it free.   │     (this is your judge talking point)
│                                 │
│                                 │
│  Nutrition  ──────────────────  │  ← H4, --text-primary
│  Per 100g · Per FSSAI DRV       │  ← Caption, --text-disabled
│                                 │
│  Calories                 387   │  ← label left, value right, bar below
│  ████████████░░░░  High         │  ← NutrientBar component
│                                 │
│  Sugar                    4.6g  │
│  ████░░░░░░░░░░░░  Low          │
│                                 │
│  Sodium                  910mg  │
│  █████████████░░░  Very High    │  ← bar color changes: green/yellow/red
│                                 │
│  Protein                   8g   │
│  ████░░░░░░░░░░░░  Low          │
│                                 │
│                                 │
│  Label Report  ─────  🟡 Not Clean — 2 concerns   │
│                                 │  ← Section header: H4 --text-primary left
│                                 │     "🟡 Not Clean — 2 concerns" right: Small, --moderate-text
│                                 │     (if label_clean=true: "✅ Clean Label" in --safe-text)
│  ┌─────────────────────────┐    │
│  │ ● Wheat Flour           │    │  ← IngredientPill collapsed: 44px height
│  ├─────────────────────────┤    │     ● dot color: ok=green, warning=yellow, caution=red
│  │ ● INS 508        [tap↓] │    │     Tap to expand
│  │   Potassium Chloride    │    │  ← Expanded state:
│  │   Salt substitute,      │    │     plain_name on line 2, --text-primary, Small
│  │   safe in moderation    │    │     explanation on line 3, --text-secondary, Small
│  │   Source: EFSA 2019     │    │  ← source on last line, --text-disabled, Caption
│  ├─────────────────────────┤    │     style: monospace, letter-spacing wide
│  │ ● INS 635        [tap↓] │    │
│  │   Disodium Ribonucl.    │    │
│  │   Flavour enhancer,     │    │
│  │   avoid if gout-prone   │    │
│  │   Source: WHO Additives │    │
│  └─────────────────────────┘    │
│                                 │
│                                 │
│  🇮🇳 Indian Context              │  ← H4 + flag emoji
│  ┌─────────────────────────┐    │
│  │ Common chai-time snack. │    │  ← bg: rgba(99,102,241,0.06)
│  │ Okay occasionally but   │    │     border: rgba(99,102,241,0.15)
│  │ not a daily option.     │    │     border-radius 10px, padding 14px
│  └─────────────────────────┘    │
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Scan Another Product   │    │  ← same as primary button but outlined
│  └─────────────────────────┘    │     border: --border-strong, bg: transparent
│                                 │
│  Results are AI-assisted.       │  ← Caption, --text-disabled, centered
│  Not medical advice.            │
│                                 │
│  [bottom safe area]             │
└─────────────────────────────────┘
```

### Verdict Card — Enter Animation
```
1. Card enters: translateY(32px) → translateY(0), 500ms, ease-out
2. Background color fades in: opacity 0 → 1, 400ms, 100ms delay
3. Glow appears: 300ms, 200ms delay
4. Text inside fades up line by line: 300ms each, 40ms stagger
5. ● icon: scale(0) → scale(1), spring easing, 300ms, 400ms delay
```

### NutrientBar — Fill Animation
```css
.nutrient-bar-fill {
  height: 4px;
  border-radius: 9999px;
  transform-origin: left;
  transform: scaleX(0);
  animation: fill 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes fill {
  to { transform: scaleX(1); }
}

/* Colors by level */
.level-low      { background: #22C55E; }
.level-medium   { background: #EAB308; }
.level-high     { background: #EF4444; }
.level-veryhigh { background: #DC2626; }
```

### Ingredient Pill — Expand on Tap
```
Collapsed: flag dot + ingredient name (INS 211) + chevron, height 44px
Expanded:  flag dot + plain_name (Sodium Benzoate) bold
           explanation text below, --text-secondary
           source line at bottom: "Source: EFSA 2019" — Caption, --text-disabled, monospace
Height transition: max-height 44px → 130px, 250ms ease-out
```

```css
.ingredient-source {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #3F3F46;  /* --text-disabled */
  margin-top: 4px;
}
```

### "Try Instead" Alternative Card
```
Only renders when: verdict === "moderation" || verdict === "caution"
                   AND alternative.found === true

Layout: flex row, gap 12px, align-items center
  Left:  48x48px product image, border-radius 8px, bg --bg-elevated as fallback
  Mid:   product name (H4), brand (Small --text-tertiary)
         2 "why better" tags: "✓ Lower sodium" "✓ More protein" — Caption, --safe-text
  Right: chevron → (links to that product's scan result)

Card style: bg --bg-surface, border --border-subtle, border-radius 12px, padding 14px
Hover: border --border-strong, bg --bg-elevated, transition 150ms
```

---

## Screen 6 — Product Not Found (/not-found)

### Purpose
Graceful fallback when barcode returns no result from Open Food Facts.

### Psychological Principles Applied
- **Effort justification:** Don't just say "not found" — explain WHY and give a path forward
- **Illusion of progress:** Even the fallback leads somewhere — image scan option

### Layout

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  ← Back                         │
│                                 │
│        [icon — 48px]            │  ← question mark in dotted circle
│                                 │     icon color: --text-tertiary
│  Product not in database        │  ← H2, --text-primary, centered
│                                 │
│  This product isn't in the      │  ← Body, --text-secondary, centered
│  Open Food Facts database yet.  │     max-width: 260px
│  That's common for newer or     │
│  regional Indian products.      │
│                                 │
│  ─────── Try instead ──────── │  ← Caption, --text-disabled
│                                 │
│  ┌─────────────────────────┐    │
│  │  📷  Scan Package Label │    │  ← Primary button — indigo
│  └─────────────────────────┘    │     uses Gemini Vision to identify
│                                 │
│  ┌─────────────────────────┐    │
│  │  ⌨️   Enter Manually     │    │  ← Secondary — outlined
│  └─────────────────────────┘    │     opens text input for product name
│                                 │
└─────────────────────────────────┘
```

---

## Screen 7 — Manual Search Results (/search)

### Purpose
When user types a product name, show matching results from Open Food Facts text search.

### Layout

```
┌─────────────────────────────────┐  ← bg: #080808
│                                 │
│  ← Back                         │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🔍  Maggi Masala       │ × │  ← search input, pre-filled, clearable
│  └─────────────────────────┘    │
│                                 │
│  4 products found               │  ← Small, --text-tertiary
│                                 │
│  ┌─────────────────────────┐    │
│  │ [img]  Maggi 2-Minute   │    │  ← result row: 64px tall
│  │        Masala Noodles   │    │     image: 48x48, border-radius 8px
│  │        Nestlé · 70g  →  │    │     chevron right: --text-tertiary
│  ├─────────────────────────┤    │     bg: --bg-surface
│  │ [img]  Maggi Atta       │    │     divider: --border-subtle
│  │        Noodles         →│    │
│  ├─────────────────────────┤    │
│  │ [img]  Maggi Oats       │    │
│  │        Noodles         →│    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## Global Components

### Bottom Safe Area
All screens on iPhone have 34px safe area at bottom. Add `padding-bottom: calc(16px + env(safe-area-inset-bottom))` to the last element on every scroll view.

### Navigation Bar (top)
```css
.nav-bar {
  display: flex; align-items: center;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top));
  border-bottom: 1px solid #1C1C1C;
  background: rgba(8,8,8,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 50;
}
```

### Toast Notification
```
Position: top of screen, centered
Enter: translateY(-100%) → translateY(0), 300ms, ease-out
Exit: translateY(-100%), 200ms, ease-in, after 3000ms
Style: bg #1A1A1A, border --border-default, border-radius 10px, padding 12px 16px
```

### Empty State (no recent scans)
```
Icon: 32px dashed circle
Text: "No scans yet" — H4 --text-secondary
Subtext: "Scan your first product" — Body --text-disabled
```

---

## Tailwind Config (Add to tailwind.config.js)

```js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#080808',
        surface:  '#111111',
        elevated: '#1A1A1A',
        overlay:  '#222222',
        border: {
          subtle:  '#1C1C1C',
          default: '#2A2A2A',
          strong:  '#3D3D3D',
        },
        safe:     { DEFAULT: '#22C55E', bg: 'rgba(22,163,74,0.10)', border: 'rgba(34,197,94,0.25)' },
        moderate: { DEFAULT: '#FACC15', bg: 'rgba(202,138,4,0.10)',  border: 'rgba(234,179,8,0.25)' },
        caution:  { DEFAULT: '#F87171', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(239,68,68,0.25)' },
        accent:   '#6366F1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite linear',
        pop:     'pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill:    'fill 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scan:    'scan 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
        pop: {
          from: { transform: 'scale(0)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        fill: {
          to: { transform: 'scaleX(1)' },
        },
        scan: {
          '0%':   { top: '0%',   opacity: '1' },
          '45%':  { top: '100%', opacity: '1' },
          '50%':  { top: '100%', opacity: '0' },
          '55%':  { top: '0%',   opacity: '0' },
          '60%':  { top: '0%',   opacity: '1' },
          '100%': { top: '100%', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## index.css (Global Styles)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

body {
  background: #080808;
  color: #F4F4F5;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  max-width: 480px;
  margin: 0 auto;
}

/* Hide scrollbars globally */
::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; }

/* Smooth scroll */
html { scroll-behavior: smooth; }

/* Focus ring — accessible but styled */
*:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
}
```

---

*SCREENS.md v1.0 — NutriScan | HackHorizon 2K26*
