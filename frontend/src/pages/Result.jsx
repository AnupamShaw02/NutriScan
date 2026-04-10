import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addToHistory } from '../utils/api'

const GRADE = {
  A: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: 'Safe for daily use' },
  B: { color: '#65A30D', bg: '#F7FEE7', border: '#D9F99D', label: 'Good choice' },
  C: { color: '#CA8A04', bg: '#FFFBEB', border: '#FDE68A', label: 'Consume occasionally' },
  D: { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'Better options exist' },
  E: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'We\'d skip this one' },
}

const LEVEL_COLOR = { low: '#16A34A', medium: '#CA8A04', high: '#EA580C', 'very-high': '#DC2626' }
const LEVEL_WIDTH = { low: '22%', medium: '50%', high: '76%', 'very-high': '95%' }
const LEVEL_LABEL = { low: 'LOW', medium: 'MED', high: 'HIGH', 'very-high': 'V.HIGH' }
const FLAG_COLOR  = { ok: '#16A34A', warning: '#CA8A04', caution: '#DC2626' }

const NUTRIENT_REF = {
  calories: { label: 'Reference: 2000 kcal/day' },
  sugar:    { label: 'WHO limit: 50g/day' },
  sodium:   { label: 'WHO limit: 2000mg/day' },
  fat:      { label: 'Reference: 65g/day' },
  protein:  { label: 'Reference: 50g/day' },
  fiber:    { label: 'Reference: 25g/day' },
}

function computeScore(verdict, nutrition = {}, ingredients = []) {
  let s = 100
  if (verdict === 'moderation') s -= 28
  if (verdict === 'caution')    s -= 58
  Object.values(nutrition).forEach(l => { if (l === 'high') s -= 7; if (l === 'very-high') s -= 14 })
  ingredients.forEach(i => { if (i.flag === 'warning') s -= 3; if (i.flag === 'caution') s -= 7 })
  return Math.max(0, Math.min(100, Math.round(s)))
}

function scoreToGrade(s) {
  if (s >= 75) return 'A'
  if (s >= 55) return 'B'
  if (s >= 40) return 'C'
  if (s >= 25) return 'D'
  return 'E'
}

function Row({ children, last }) {
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid #F0EDE6' }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 16px 10px', borderBottom: '1px solid #F0EDE6', margin: 0 }}>
      {children}
    </p>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E1D6', overflow: 'hidden', marginBottom: '10px', ...style }}>
      {children}
    </div>
  )
}

export default function Result() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const [open,    setOpen]    = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!state) { navigate('/'); return }
    addToHistory(state)
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  if (!state) return null

  const { product = {}, analysis = {}, alternative = {} } = state
  const {
    verdict = 'moderation',
    verdict_headline,
    hindi_verdict,
    profile_note,
    label_clean,
    label_concerns_count = 0,
    ingredients_explained = [],
    nutrition_levels = {},
    indian_context,
  } = analysis

  const score = computeScore(verdict, nutrition_levels, ingredients_explained)
  const grade = scoreToGrade(score)
  const gc    = GRADE[grade]
  const nm    = product.nutriments || {}

  function getVal(key) {
    const v = {
      calories: nm['energy-kcal_100g'] ?? nm['energy_100g'],
      sugar:    nm['sugars_100g'],
      sodium:   nm['sodium_100g'] != null ? Math.round(nm['sodium_100g'] * 1000) : null,
      fat:      nm['fat_100g'],
      protein:  nm['proteins_100g'],
      fiber:    nm['fiber_100g'],
    }[key]
    if (v == null) return null
    return parseFloat(parseFloat(v).toFixed(1))
  }

  const nutrients = [
    { key: 'calories', label: 'Calories', unit: 'kcal', lv: nutrition_levels.calories },
    { key: 'fat',      label: 'Total Fat', unit: 'g',   lv: null },
    { key: 'sugar',    label: 'Sugars',    unit: 'g',   lv: nutrition_levels.sugar },
    { key: 'sodium',   label: 'Sodium',    unit: 'mg',  lv: nutrition_levels.sodium },
    { key: 'protein',  label: 'Protein',   unit: 'g',   lv: nutrition_levels.protein },
    { key: 'fiber',    label: 'Fibre',     unit: 'g',   lv: null },
  ]

  const show = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(12px)',
    transition: `opacity 420ms ease ${d}ms, transform 420ms cubic-bezier(0.16,1,0.3,1) ${d}ms`,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', paddingBottom: '32px' }}>

      {/* Nav */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '52px',
        background: '#fff', borderBottom: '1px solid #E5E1D6',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: '14px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Back
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>Safety Report</span>
        <div style={{ width: '60px' }} />
      </header>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Product ── */}
        <div style={show(0)}>
          <Card>
            <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#F7F4EE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E1D6' }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D6D0C8" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {product.name || 'Unknown Product'}
                </h1>
                <p style={{ fontSize: '13px', color: '#A8A29E', margin: 0 }}>
                  {[product.brand, product.weight].filter(Boolean).join(' · ') || 'No brand info'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Grade card ── */}
        <div style={show(70)}>
          <div style={{ background: gc.bg, border: `1px solid ${gc.border}`, borderRadius: '12px', padding: '20px 20px 16px', marginBottom: '10px' }}>
            {/* Top row: letter + info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '12px', background: gc.color, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                animation: 'pop 450ms cubic-bezier(0.34,1.56,0.64,1) 200ms both',
              }}>
                <span style={{ color: '#fff', fontSize: '40px', fontWeight: 900, lineHeight: 1 }}>{grade}</span>
              </div>
              <div style={{ flex: 1, paddingTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: gc.color }}>{gc.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: gc.color, background: `${gc.color}18`, borderRadius: '6px', padding: '2px 7px' }}>
                    {score}/100
                  </span>
                </div>
                {verdict_headline && (
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', lineHeight: 1.3, marginBottom: '4px' }}>
                    {verdict_headline}
                  </p>
                )}
                {hindi_verdict && (
                  <p style={{ fontSize: '13px', color: '#6B6760' }}>{hindi_verdict}</p>
                )}
              </div>
            </div>
            {/* Grade bar */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['A','B','C','D','E'].map(g => (
                <div key={g} style={{ flex: 1, height: '5px', borderRadius: '3px', background: g === grade ? GRADE[g].color : '#E5E1D6', transition: 'background 300ms' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── "Not your fault" — caution only ── */}
        {verdict === 'caution' && (
          <div style={show(100)}>
            <div style={{ background: '#1C1917', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#FCA5A5', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>For your awareness</p>
                <p style={{ fontSize: '13px', color: '#E7E5E4', lineHeight: 1.55 }}>
                  Food companies spend millions engineering products to taste better than they look on a label. You found this in 3 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Profile alert ── */}
        {profile_note && (
          <div style={show(110)}>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>Personalised alert</p>
                <p style={{ fontSize: '13px', color: '#1C1917', lineHeight: 1.55 }}>{profile_note}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Nutrition ── */}
        <div style={show(140)}>
          <Card>
            <SectionLabel>Nutrition · per 100g</SectionLabel>
            <div style={{ padding: '8px 16px 4px' }}>
              {nutrients.map(n => {
                const v = getVal(n.key)
                if (v === null) return null
                const lc = n.lv ? LEVEL_COLOR[n.lv] : '#D6D0C8'
                const lw = n.lv ? LEVEL_WIDTH[n.lv] : '0%'
                const ref = NUTRIENT_REF[n.key]
                return (
                  <div key={n.key} style={{ paddingBottom: '12px', marginBottom: '8px', borderBottom: '1px solid #F7F4EE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#6B6760' }}>{n.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', fontVariantNumeric: 'tabular-nums' }}>{v}{n.unit}</span>
                        {n.lv && (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: LEVEL_COLOR[n.lv], background: `${LEVEL_COLOR[n.lv]}15`, borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.04em' }}>
                            {LEVEL_LABEL[n.lv]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: '4px', background: '#F0EDE6', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: lw, borderRadius: '2px', background: lc, animation: 'fillBar 700ms cubic-bezier(0.16,1,0.3,1) both' }} />
                    </div>
                    {ref && n.lv && (
                      <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '3px' }}>{ref.label}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── Ingredients ── */}
        {ingredients_explained.length > 0 && (
          <div style={show(180)}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px', borderBottom: '1px solid #F0EDE6' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>What's actually inside</p>
                {label_clean
                  ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '2px 8px' }}>Clean label</span>
                  : <span style={{ fontSize: '11px', fontWeight: 700, color: '#CA8A04', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '2px 8px' }}>{label_concerns_count} concern{label_concerns_count !== 1 ? 's' : ''}</span>
                }
              </div>
              {ingredients_explained.map((ing, i) => {
                const dot = FLAG_COLOR[ing.flag] || FLAG_COLOR.ok
                const isOpen = open === i
                const isLast = i === ingredients_explained.length - 1
                return (
                  <Row key={i} last={isLast && !isOpen}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot, flexShrink: 0, boxShadow: `0 0 0 2px ${dot}22` }} />
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>
                        {ing.plain_name || ing.name}
                      </span>
                      {ing.name && ing.plain_name && ing.name !== ing.plain_name && (
                        <span style={{ fontSize: '11px', color: '#A8A29E', fontStyle: 'italic' }}>{ing.name}</span>
                      )}
                      <span style={{ color: '#D6D0C8', fontSize: '12px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }}>▾</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '8px 16px 14px 33px', background: '#FAFAF8', borderBottom: !isLast ? '1px solid #F0EDE6' : 'none', animation: 'fadeUp 180ms ease both' }}>
                        {ing.explanation && <p style={{ fontSize: '13px', color: '#6B6760', lineHeight: 1.55, margin: 0, marginBottom: ing.source ? '6px' : 0 }}>{ing.explanation}</p>}
                        {ing.source && <p style={{ fontSize: '11px', color: '#A8A29E', fontFamily: 'monospace', margin: 0 }}>{ing.source}</p>}
                      </div>
                    )}
                  </Row>
                )
              })}
            </Card>
          </div>
        )}

        {/* ── Indian context ── */}
        {indian_context && (
          <div style={show(210)}>
            <Card>
              <div style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🇮🇳</span>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>In your diet</p>
                  <p style={{ fontSize: '13px', color: '#1C1917', lineHeight: 1.55, margin: 0 }}>{indian_context}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── Alternative ── */}
        {verdict !== 'safe' && alternative?.found && (
          <div style={show(240)}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #D1FAE5' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Try this instead</p>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                {alternative.image_url && (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#fff', overflow: 'hidden', flexShrink: 0, border: '1px solid #D1FAE5' }}>
                    <img src={alternative.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alternative.name}</p>
                  {alternative.brand && <p style={{ fontSize: '12px', color: '#6B6760', marginBottom: '6px' }}>{alternative.brand}</p>}
                  {alternative.why_better?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {alternative.why_better.map((w, i) => (
                        <span key={i} style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', borderRadius: '4px', padding: '2px 7px' }}>✓ {w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={show(270)}>
          <button
            onClick={() => navigate('/scan')}
            style={{
              width: '100%', height: '52px', border: 'none', borderRadius: '12px',
              background: '#16A34A', color: '#fff', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', marginBottom: '10px',
              transition: 'background 130ms, transform 100ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Scan another product
          </button>
          <p style={{ color: '#A8A29E', fontSize: '11px', textAlign: 'center', letterSpacing: '0.03em' }}>
            AI-assisted. Not a substitute for medical advice.
          </p>
        </div>

      </div>
    </div>
  )
}
