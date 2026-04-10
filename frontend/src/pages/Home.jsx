import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScanHistory, getHealthProfile, scanBarcode } from '../utils/api'

// ── constants ──────────────────────────────────────────────────────────────────

const TIPS = [
  'Check sodium — anything above 600mg/100g is high for daily use.',
  'Look for "partially hydrogenated" in ingredients — that means trans fat.',
  "More than 5 ingredients you can't pronounce? Worth a second look.",
  "FSSAI logo on pack means it's been approved for the Indian market.",
  'Sugar appears as fructose, sucrose, maltose, dextrose — all the same thing.',
  'Palm oil is the most common oil in Indian packaged snacks. High in saturated fat.',
  'Per-serving vs per-100g: always compare on per-100g to avoid misleading labels.',
]

const GRADE_INFO = {
  A: { color: '#16A34A', bg: '#DCFCE7', desc: 'Excellent nutritional profile. Safe for daily consumption.' },
  B: { color: '#65A30D', bg: '#ECFCCB', desc: 'Good choice with minor concerns. Suitable for regular use.' },
  C: { color: '#CA8A04', bg: '#FEF9C3', desc: 'Moderate quality. Consume occasionally and in limited amounts.' },
  D: { color: '#EA580C', bg: '#FFEDD5', desc: 'Poor nutritional value. High in sugar, sodium or additives.' },
  E: { color: '#DC2626', bg: '#FEE2E2', desc: 'Avoid. High trans-fats, excessive sugar or harmful additives.' },
}

const VERDICT_GRADE = {
  safe:       { grade: 'A', score: 78, color: '#16A34A', label: 'Safe' },
  moderation: { grade: 'C', score: 45, color: '#CA8A04', label: 'Moderate' },
  caution:    { grade: 'E', score: 18, color: '#DC2626', label: 'Avoid' },
}

const AVATAR_COLORS = [
  '#EF4444','#F97316','#EAB308','#22C55E',
  '#06B6D4','#8B5CF6','#EC4899','#14B8A6',
]

function avatarColor(name = '') {
  return AVATAR_COLORS[(name.toUpperCase().charCodeAt(0) || 65) % AVATAR_COLORS.length]
}

function getInsight(history, tipIndex) {
  if (history.length === 0) return { icon: '💡', text: TIPS[tipIndex] }
  const cautionCount = history.filter(h => h.verdict === 'caution').length
  const safeCount    = history.filter(h => h.verdict === 'safe').length
  const total = history.length
  if (cautionCount >= 2)
    return { icon: '⚠️', text: `${cautionCount} of your last ${total} scans were flagged "Avoid". Check the alternatives recommended in each result.` }
  if (safeCount === total && total >= 3)
    return { icon: '🌟', text: `Impressive! All ${total} of your recent scans rated Safe. Your food choices are above average.` }
  return { icon: '💡', text: TIPS[tipIndex] }
}

// ── component ──────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate  = useNavigate()
  const inputRef  = useRef(null)

  const [history,      setHistory]      = useState([])
  const [visible,      setVisible]      = useState(false)
  const [barcode,      setBarcode]      = useState('')
  const [loading,      setLoading]      = useState(false)
  const [apiError,     setApiError]     = useState(null)
  const [shake,        setShake]        = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [gradeTooltip, setGradeTooltip] = useState(null)
  const [tipIndex]                      = useState(() => Math.floor(Math.random() * TIPS.length))

  useEffect(() => {
    setHistory(getScanHistory())
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  // close grade tooltip on outside click
  useEffect(() => {
    if (!gradeTooltip) return
    const close = () => setGradeTooltip(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [gradeTooltip])

  function anim(delay = 0) {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(16px)',
      transition: `opacity 480ms ease-out ${delay}ms, transform 480ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }
  }

  function handleBarcodeChange(e) {
    setBarcode(e.target.value.replace(/\D/g, ''))
    setApiError(null)
  }

  function isValidBarcode(code) {
    return /^\d{8,14}$/.test(code)
  }

  async function handleLookup(e) {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) return
    if (!isValidBarcode(code)) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const profile = getHealthProfile()
      const result  = await scanBarcode(code, profile)
      navigate('/result', { state: result })
    } catch {
      setApiError('Could not reach server. Is the backend running?')
      setLoading(false)
    }
  }

  const uniqueHistory = history
    .filter((item, idx, arr) => arr.findIndex(h => h.name === item.name) === idx)
    .slice(0, 5)

  const insight = getInsight(history, tipIndex)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB', paddingBottom: '88px' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: '#FFFFFF', borderBottom: '1px solid #E8E4D8',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '9px', background: '#16A34A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
          </div>
          <span style={{ color: '#1A1916', fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            NutriScan
          </span>
        </div>

        {/* FSSAI Verified badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          borderRadius: '20px', padding: '4px 10px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}>
            FSSAI Guided
          </span>
        </div>
      </div>

      <div style={{ padding: '18px 16px 0' }}>

        {/* ── Hero card with mesh gradient ── */}
        <div style={{ ...anim(0), marginBottom: '14px' }}>
          <div style={{
            borderRadius: '22px', padding: '26px 22px 24px',
            background: 'linear-gradient(135deg, #166534 0%, #16A34A 38%, #0D9488 72%, #115E59 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', right: '-24px', top: '-24px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', right: '40px', bottom: '-32px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', left: '-20px', bottom: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>
              Instant AI Analysis
            </p>
            <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '20px' }}>
              Scan any food<br />product barcode
            </h2>

            <button
              onClick={() => navigate('/scan')}
              style={{
                background: '#FFFFFF', border: 'none', borderRadius: '13px',
                padding: '13px 22px', color: '#16A34A',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                transition: 'transform 180ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 150ms',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)' }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)' }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                <line x1="7" y1="12" x2="17" y2="12"/>
              </svg>
              Scan Now
            </button>
          </div>
        </div>

        {/* ── Barcode input (ghost style) ── */}
        <div style={{ ...anim(80), marginBottom: '14px' }}>
          <form onSubmit={handleLookup}>
            <div style={{
              display: 'flex', gap: '8px',
              animation: shake ? 'shake 0.55s ease both' : 'none',
            }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                background: inputFocused ? '#FFFFFF' : '#EFECE4',
                border: `1.5px solid ${shake ? '#EF4444' : inputFocused ? '#16A34A' : 'transparent'}`,
                borderRadius: '13px', padding: '0 14px', height: '50px',
                transition: 'background 200ms, border-color 200ms',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke={inputFocused ? '#16A34A' : '#9B9890'} strokeWidth="2" strokeLinecap="round"
                  style={{ marginRight: '8px', flexShrink: 0, transition: 'stroke 200ms' }}>
                  <rect x="2" y="4" width="3" height="16" rx="0.5"/>
                  <rect x="7" y="4" width="1.5" height="16" rx="0.5"/>
                  <rect x="10.5" y="4" width="2.5" height="16" rx="0.5"/>
                  <rect x="15" y="4" width="1.5" height="16" rx="0.5"/>
                  <rect x="18.5" y="4" width="3" height="16" rx="0.5"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter barcode number…"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  disabled={loading}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: '#1A1916', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  }}
                />
                {barcode && (
                  <button
                    type="button"
                    onClick={() => setBarcode('')}
                    style={{
                      background: '#D5D0C3', border: 'none', borderRadius: '50%',
                      width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6B6760', fontSize: '13px', lineHeight: 1,
                    }}
                  >×</button>
                )}
              </div>

              <button
                type="submit"
                disabled={!barcode || loading}
                style={{
                  height: '50px', width: '50px', flexShrink: 0,
                  background: barcode && !loading ? '#16A34A' : '#E8E4D8',
                  border: 'none', borderRadius: '13px',
                  color: barcode && !loading ? '#FFFFFF' : '#9B9890',
                  fontSize: '20px', cursor: barcode && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms',
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 600ms linear infinite' }} />
                ) : '→'}
              </button>
            </div>

            {apiError && (
              <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '7px', paddingLeft: '4px' }}>
                {apiError}
              </p>
            )}
            {shake && barcode && (
              <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '7px', paddingLeft: '4px' }}>
                Enter a valid 8–14 digit barcode.
              </p>
            )}
          </form>
        </div>

        {/* ── Grade key (compact + interactive) ── */}
        <div style={{ ...anim(140), marginBottom: '14px' }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px',
            border: '1px solid #E8E4D8', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#9B9890', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Grade System
              </span>
              <span style={{ color: '#C5C2BA', fontSize: '11px' }}>Tap to learn</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(GRADE_INFO).map(([g, info]) => (
                <div
                  key={g}
                  style={{ flex: 1, position: 'relative' }}
                  onClick={e => { e.stopPropagation(); setGradeTooltip(gradeTooltip === g ? null : g) }}
                >
                  <div style={{
                    width: '100%', paddingTop: '100%', borderRadius: '10px',
                    background: gradeTooltip === g ? info.color : info.bg,
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 200ms, transform 150ms',
                    transform: gradeTooltip === g ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: gradeTooltip === g ? `0 4px 12px ${info.color}40` : 'none',
                  }}>
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '18px',
                      color: gradeTooltip === g ? '#FFFFFF' : info.color,
                      transition: 'color 200ms',
                    }}>{g}</span>
                  </div>

                  {/* Tooltip */}
                  {gradeTooltip === g && (
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 10px)',
                      left: '50%', transform: 'translateX(-50%)',
                      background: '#1A1916', color: '#FFFFFF',
                      fontSize: '12px', lineHeight: 1.45, fontWeight: 400,
                      borderRadius: '10px', padding: '10px 12px',
                      width: '180px', zIndex: 99,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      animation: 'tooltipIn 180ms ease-out both',
                      pointerEvents: 'none',
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '3px', color: info.color === '#DC2626' ? '#FCA5A5' : info.color === '#16A34A' ? '#86EFAC' : '#FDE68A' }}>
                        Grade {g}
                      </div>
                      {info.desc}
                      {/* Arrow */}
                      <div style={{
                        position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                        width: '10px', height: '10px', background: '#1A1916',
                        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Insight card ── */}
        <div style={{ ...anim(200), marginBottom: '18px' }}>
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: '16px', padding: '15px 16px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0, animation: 'glowPulse 2s ease-in-out infinite', display: 'block' }}>
              {insight.icon}
            </span>
            <div>
              <p style={{ color: '#92400E', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {history.length > 0 ? 'Your Insight' : 'Did You Know?'}
              </p>
              <p style={{ color: '#1A1916', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
                {insight.text}
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent scans ── */}
        {uniqueHistory.length > 0 && (
          <div style={anim(260)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#1A1916', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Recent Scans
              </span>
              <span style={{ color: '#9B9890', fontSize: '12px' }}>
                {uniqueHistory.length} unique
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uniqueHistory.map((item, i) => {
                const vg  = VERDICT_GRADE[item.verdict] || VERDICT_GRADE.moderation
                const letter = (item.name || item.brand || '?').charAt(0).toUpperCase()
                const bgColor = avatarColor(item.name)

                return (
                  <div
                    key={i}
                    style={{
                      background: '#FFFFFF', border: '1px solid #E8E4D8',
                      borderRadius: '16px', padding: '13px 14px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      animation: `slideUp 350ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both`,
                    }}
                  >
                    {/* Avatar — image or colorful letter */}
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px',
                      flexShrink: 0, overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: item.image_url ? '#F5F2EB' : bgColor,
                    }}>
                      {item.image_url
                        ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 800 }}>{letter}</span>
                      }
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: '#1A1916', fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.brand ? `${item.brand}` : item.name}
                      </p>
                      <p style={{
                        color: '#9B9890', fontSize: '12px', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.brand ? item.name : 'No brand info'}
                      </p>
                    </div>

                    {/* Grade sticker */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: vg.color, borderRadius: '12px',
                      padding: '7px 11px', flexShrink: 0,
                      boxShadow: `0 3px 10px ${vg.color}55`,
                    }}>
                      <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 900, lineHeight: 1 }}>
                        {vg.grade}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', fontWeight: 700, letterSpacing: '0.05em', marginTop: '1px' }}>
                        GRADE
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {uniqueHistory.length === 0 && !loading && (
          <div style={{ ...anim(260), textAlign: 'center', padding: '28px 20px 0' }}>
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" style={{ marginBottom: '16px' }}>
              {/* Cart body */}
              <rect x="22" y="55" width="64" height="36" rx="10" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2"/>
              {/* Handle */}
              <path d="M32 55 L27 32 L12 32" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              {/* Wheels */}
              <circle cx="38" cy="96" r="6" fill="#16A34A"/>
              <circle cx="70" cy="96" r="6" fill="#16A34A"/>
              {/* Product items */}
              <rect x="33" y="42" width="14" height="17" rx="4" fill="#22C55E"/>
              <rect x="51" y="39" width="13" height="20" rx="4" fill="#4ADE80"/>
              <circle cx="77" cy="47" r="9" fill="#86EFAC"/>
              {/* Shine on circle */}
              <circle cx="73" cy="43" r="3" fill="rgba(255,255,255,0.4)"/>
              {/* Grade badge */}
              <rect x="62" y="10" width="34" height="24" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5"/>
              <text x="79" y="27" textAnchor="middle" fontSize="13" fontWeight="900" fill="#16A34A">A</text>
            </svg>
            <h3 style={{ color: '#1A1916', fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Your health journey starts here
            </h3>
            <p style={{ color: '#9B9890', fontSize: '13px', lineHeight: 1.55, maxWidth: '240px', margin: '0 auto' }}>
              Scan a product barcode to get an instant AI safety verdict.
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
