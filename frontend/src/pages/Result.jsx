import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addToHistory } from '../utils/api'

const GRADE = {
  A: { color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0', label: 'Excellent Choice' },
  B: { color: '#65A30D', bg: '#ECFCCB', border: '#D9F99D', label: 'Good Choice' },
  C: { color: '#CA8A04', bg: '#FEF9C3', border: '#FDE68A', label: 'Consume in Moderation' },
  D: { color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA', label: 'Poor Choice' },
  E: { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', label: 'Avoid This Product' },
}

const LEVEL_COLOR = {
  low:        '#16A34A',
  medium:     '#CA8A04',
  high:       '#EA580C',
  'very-high':'#DC2626',
}

const LEVEL_WIDTH = {
  low: '22%', medium: '52%', high: '76%', 'very-high': '95%',
}

const FLAG_COLOR = {
  ok:      '#16A34A',
  warning: '#CA8A04',
  caution: '#DC2626',
}

function computeScore(verdict, nutrition_levels = {}, ingredients_explained = []) {
  let score = 100
  if (verdict === 'moderation') score -= 28
  if (verdict === 'caution')    score -= 58

  Object.values(nutrition_levels).forEach(l => {
    if (l === 'high')      score -= 7
    if (l === 'very-high') score -= 14
  })

  ingredients_explained.forEach(i => {
    if (i.flag === 'warning') score -= 3
    if (i.flag === 'caution') score -= 7
  })

  return Math.max(0, Math.min(100, Math.round(score)))
}

function scoreToGrade(score) {
  if (score >= 75) return 'A'
  if (score >= 55) return 'B'
  if (score >= 40) return 'C'
  if (score >= 25) return 'D'
  return 'E'
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '18px',
      border: '1px solid #E8E4D8', overflow: 'hidden',
      marginBottom: '12px', ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{
      color: '#9B9890', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase',
      padding: '14px 16px 8px', margin: 0,
      borderBottom: '1px solid #F5F2EB',
    }}>
      {children}
    </p>
  )
}

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
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
  const gc = GRADE[grade]

  const nm = product.nutriments || {}

  function val(key) {
    const map = {
      calories: nm['energy-kcal_100g'] ?? nm['energy_100g'],
      sugar:    nm['sugars_100g'],
      sodium:   nm['sodium_100g'] != null ? Math.round(nm['sodium_100g'] * 1000) : null,
      fat:      nm['fat_100g'],
      protein:  nm['proteins_100g'],
      fiber:    nm['fiber_100g'],
    }
    const n = map[key]
    if (n == null) return null
    return typeof n === 'number' ? parseFloat(n.toFixed(1)) : n
  }

  const nutrients = [
    { key: 'calories', label: 'Calories',  unit: 'kcal', lv: nutrition_levels.calories },
    { key: 'fat',      label: 'Total Fat',  unit: 'g',   lv: null },
    { key: 'sugar',    label: 'Sugars',     unit: 'g',   lv: nutrition_levels.sugar },
    { key: 'sodium',   label: 'Sodium',     unit: 'mg',  lv: nutrition_levels.sodium },
    { key: 'protein',  label: 'Protein',    unit: 'g',   lv: nutrition_levels.protein },
    { key: 'fiber',    label: 'Fibre',      unit: 'g',   lv: null },
  ]

  function anim(delay = 0) {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(14px)',
      transition: `opacity 450ms ease-out ${delay}ms, transform 450ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB', paddingBottom: '32px' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E8E4D8',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B6760', fontSize: '14px', padding: 0,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          ← Back
        </button>
        <span style={{ color: '#1A1916', fontSize: '14px', fontWeight: 600 }}>Product Analysis</span>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Product card */}
        <div style={{ ...anim(0) }}>
          <Card>
            <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '12px',
                background: '#F5F2EB', flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #E8E4D8',
              }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#C5C2BA', fontSize: '28px' }}>?</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  color: '#1A1916', fontSize: '16px', fontWeight: 700,
                  lineHeight: 1.3, marginBottom: '4px',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {product.name || 'Unknown Product'}
                </h1>
                <p style={{ color: '#9B9890', fontSize: '13px', margin: 0 }}>
                  {[product.brand, product.weight].filter(Boolean).join(' · ') || 'No brand info'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Score + Grade card */}
        <div style={{ ...anim(80) }}>
          <Card style={{ border: `1px solid ${gc.border}`, background: gc.bg }}>
            <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Big grade circle */}
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: gc.color, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${gc.color}40`,
                animation: 'pop 400ms cubic-bezier(0.34,1.56,0.64,1) 200ms both',
              }}>
                <span style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>
                  {grade}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: gc.color, fontSize: '14px', fontWeight: 700 }}>
                    {gc.label}
                  </span>
                  <span style={{
                    background: gc.color, color: '#FFFFFF',
                    fontSize: '11px', fontWeight: 700, borderRadius: '6px',
                    padding: '2px 8px',
                  }}>
                    {score}/100
                  </span>
                </div>

                {verdict_headline && (
                  <p style={{
                    color: '#1A1916', fontSize: '15px', fontWeight: 600,
                    lineHeight: 1.35, marginBottom: '6px',
                  }}>
                    {verdict_headline}
                  </p>
                )}
                {hindi_verdict && (
                  <p style={{ color: '#6B6760', fontSize: '13px', margin: 0 }}>
                    {hindi_verdict}
                  </p>
                )}
              </div>
            </div>

            {/* Grade bar */}
            <div style={{ padding: '0 20px 18px', display: 'flex', gap: '4px' }}>
              {['A', 'B', 'C', 'D', 'E'].map(g => (
                <div
                  key={g}
                  style={{
                    flex: 1, height: '6px', borderRadius: '3px',
                    background: g === grade ? GRADE[g].color : '#E8E4D8',
                    transition: 'background 300ms',
                  }}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Profile note */}
        {profile_note && (
          <div style={{ ...anim(120) }}>
            <Card style={{ border: '1px solid #FECACA', background: '#FFF5F5' }}>
              <div style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ color: '#DC2626', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    Health Alert — For You
                  </p>
                  <p style={{ color: '#1A1916', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                    {profile_note}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Nutrition */}
        <div style={{ ...anim(160) }}>
          <Card>
            <SectionLabel>Nutrition Facts · per 100g</SectionLabel>
            <div style={{ padding: '12px 16px 4px' }}>
              {nutrients.map((n) => {
                const v = val(n.key)
                if (v === null) return null
                const lc = n.lv ? LEVEL_COLOR[n.lv] : '#C5C2BA'
                const lw = n.lv ? LEVEL_WIDTH[n.lv] : '0%'
                return (
                  <div key={n.key} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ color: '#6B6760', fontSize: '13px' }}>{n.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#1A1916', fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          {v}{n.unit}
                        </span>
                        {n.lv && (
                          <span style={{
                            fontSize: '10px', fontWeight: 700,
                            color: LEVEL_COLOR[n.lv],
                            background: `${LEVEL_COLOR[n.lv]}18`,
                            borderRadius: '4px', padding: '2px 6px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            {n.lv === 'very-high' ? 'V.HIGH' : n.lv.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: '5px', background: '#F5F2EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: lw, borderRadius: '3px',
                        background: lc,
                        animation: 'fillBar 600ms cubic-bezier(0.16,1,0.3,1) both',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Ingredients */}
        {ingredients_explained.length > 0 && (
          <div style={{ ...anim(200) }}>
            <Card>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px 8px', borderBottom: '1px solid #F5F2EB',
              }}>
                <p style={{ color: '#9B9890', fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
                  Ingredients Decoded
                </p>
                {label_clean
                  ? <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, background: '#DCFCE7', borderRadius: '6px', padding: '2px 8px' }}>
                      ✓ Clean Label
                    </span>
                  : <span style={{ color: '#CA8A04', fontSize: '11px', fontWeight: 700, background: '#FEF9C3', borderRadius: '6px', padding: '2px 8px' }}>
                      {label_concerns_count} concern{label_concerns_count !== 1 ? 's' : ''}
                    </span>
                }
              </div>
              {ingredients_explained.map((ing, i) => {
                const dotColor = FLAG_COLOR[ing.flag] || FLAG_COLOR.ok
                const isLast = i === ingredients_explained.length - 1
                const isOpen = open === i
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: (!isLast || isOpen) ? '1px solid #F5F2EB' : 'none',
                        textAlign: 'left', transition: 'background 100ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: dotColor, flexShrink: 0,
                        boxShadow: `0 0 0 2px ${dotColor}22`,
                      }} />
                      <span style={{ color: '#1A1916', fontSize: '13px', fontWeight: 500, flex: 1, textAlign: 'left' }}>
                        {ing.plain_name || ing.name}
                      </span>
                      {ing.name && ing.plain_name && ing.name !== ing.plain_name && (
                        <span style={{ color: '#9B9890', fontSize: '11px', fontStyle: 'italic', marginRight: '6px' }}>
                          {ing.name}
                        </span>
                      )}
                      <span style={{
                        color: '#C5C2BA', fontSize: '12px',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 200ms', flexShrink: 0,
                      }}>▾</span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '10px 16px 14px 34px',
                        background: '#FAFAF8',
                        borderBottom: !isLast ? '1px solid #F5F2EB' : 'none',
                        animation: 'slideUp 200ms ease-out both',
                      }}>
                        {ing.explanation && (
                          <p style={{ color: '#6B6760', fontSize: '13px', lineHeight: 1.55, margin: 0, marginBottom: ing.source ? '6px' : 0 }}>
                            {ing.explanation}
                          </p>
                        )}
                        {ing.source && (
                          <p style={{ color: '#C5C2BA', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
                            {ing.source}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </Card>
          </div>
        )}

        {/* Indian Context */}
        {indian_context && (
          <div style={{ ...anim(240) }}>
            <Card>
              <div style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>🇮🇳</span>
                <div>
                  <p style={{ color: '#9B9890', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    Indian Context
                  </p>
                  <p style={{ color: '#1A1916', fontSize: '13px', margin: 0, lineHeight: 1.55 }}>
                    {indian_context}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Alternative */}
        {verdict !== 'safe' && alternative?.found && (
          <div style={{ ...anim(270) }}>
            <Card style={{ border: '1px solid #BBF7D0', background: '#F0FDF4' }}>
              <div style={{ padding: '14px 16px 8px', borderBottom: '1px solid #DCFCE7' }}>
                <p style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Healthier Alternative
                </p>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                {alternative.image_url && (
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '10px',
                    background: '#FFFFFF', overflow: 'hidden', flexShrink: 0,
                    border: '1px solid #DCFCE7',
                  }}>
                    <img src={alternative.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: '#1A1916', fontSize: '14px', fontWeight: 700, marginBottom: '2px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {alternative.name}
                  </p>
                  {alternative.brand && (
                    <p style={{ color: '#6B6760', fontSize: '12px', marginBottom: '6px' }}>
                      {alternative.brand}
                    </p>
                  )}
                  {alternative.why_better?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {alternative.why_better.map((w, i) => (
                        <span key={i} style={{
                          fontSize: '11px', color: '#16A34A', fontWeight: 600,
                          background: '#DCFCE7', borderRadius: '4px', padding: '2px 7px',
                        }}>
                          ✓ {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* CTA */}
        <div style={{ ...anim(300), paddingTop: '4px' }}>
          <button
            onClick={() => navigate('/scan')}
            style={{
              width: '100%', height: '52px',
              background: '#16A34A', border: 'none', borderRadius: '14px',
              color: '#FFFFFF', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 130ms, transform 100ms',
              marginBottom: '10px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Scan Another Product
          </button>
          <p style={{ color: '#C5C2BA', fontSize: '11px', textAlign: 'center', letterSpacing: '0.04em' }}>
            AI-assisted analysis. Not a substitute for medical advice.
          </p>
        </div>

      </div>
    </div>
  )
}
