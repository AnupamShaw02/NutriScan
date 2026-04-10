import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScanHistory, getHealthProfile, scanBarcode } from '../utils/api'
import LoadingState from '../components/LoadingState'

const TIPS = [
  'Anything above 600mg sodium per 100g is high for daily use.',
  '"Partially hydrogenated" in ingredients means trans fat — the worst kind.',
  'Sugar hides under 12 different names. Fructose, dextrose, maltose — all the same.',
  'FSSAI approval means it passed safety standards — not that it\'s healthy.',
  'Always compare nutrition per 100g, not per serving. Serving sizes are misleading.',
  'Palm oil appears in 60% of Indian packaged snacks. High in saturated fat.',
  'The first 3 ingredients listed make up the bulk of what you\'re eating.',
]

const GRADE_DESC = {
  A: { color: '#16A34A', bg: '#F0FDF4', text: 'Safe for daily use. Low concerns across all checks.' },
  B: { color: '#65A30D', bg: '#F7FEE7', text: 'Good choice. Minor concerns, fine for regular use.' },
  C: { color: '#CA8A04', bg: '#FFFBEB', text: 'Occasional use only. Has some concerning ingredients.' },
  D: { color: '#EA580C', bg: '#FFF7ED', text: 'Better options exist. High in sugar, sodium, or additives.' },
  E: { color: '#DC2626', bg: '#FEF2F2', text: 'Our strongest warning. Avoid or consume very rarely.' },
}

const VERDICT_GRADE = {
  safe:       { grade: 'A', color: '#16A34A' },
  moderation: { grade: 'C', color: '#CA8A04' },
  caution:    { grade: 'E', color: '#DC2626' },
}

const COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#8B5CF6','#EC4899','#0EA5E9']
const avatarColor = (name = '') => COLORS[(name.toUpperCase().charCodeAt(0) || 65) % COLORS.length]

function getInsight(history, tipIndex) {
  if (!history.length) return { label: 'DID YOU KNOW', text: TIPS[tipIndex] }
  const caution = history.filter(h => h.verdict === 'caution').length
  const safe    = history.filter(h => h.verdict === 'safe').length
  if (caution >= 2) return { label: 'YOUR PATTERN', text: `${caution} of your last ${history.length} scans were high-risk. Check the alternatives suggested in each result.` }
  if (safe === history.length && history.length >= 3) return { label: 'YOUR STREAK', text: `All ${history.length} recent scans were safe. Your food choices are above average.` }
  return { label: 'DID YOU KNOW', text: TIPS[tipIndex] }
}

export default function Home() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [history,      setHistory]      = useState([])
  const [visible,      setVisible]      = useState(false)
  const [barcode,      setBarcode]      = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [shake,        setShake]        = useState(false)
  const [focused,      setFocused]      = useState(false)
  const [tooltip,      setTooltip]      = useState(null)
  const [tipIndex]                      = useState(() => Math.floor(Math.random() * TIPS.length))
  const [installEvt,   setInstallEvt]   = useState(null)   // beforeinstallprompt event
  const [installed,    setInstalled]    = useState(false)

  useEffect(() => {
    setHistory(getScanHistory())
    const t = setTimeout(() => setVisible(true), 40)

    // Capture the install prompt so we can trigger it with our own button
    const onPrompt = (e) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // Hide banner once installed
    const onInstalled = () => setInstalled(true)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      clearTimeout(t)
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installEvt) return
    installEvt.prompt()
    const { outcome } = await installEvt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallEvt(null)
  }

  useEffect(() => {
    if (!tooltip) return
    const h = () => setTooltip(null)
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [tooltip])

  const show = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(14px)',
    transition: `opacity 400ms ease ${delay}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  async function submit(e) {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) { inputRef.current?.focus(); return }
    if (!/^\d{8,14}$/.test(code)) {
      setShake(true); setTimeout(() => setShake(false), 550)
      return
    }
    setLoading(true); setError(null)
    try {
      const result = await scanBarcode(code, getHealthProfile())
      if (!result.found) { navigate('/not-found'); return }
      navigate('/result', { state: result })
    } catch {
      setError('Cannot reach server. Is the backend running?')
      setLoading(false)
    }
  }

  const history5 = history
    .filter((item, i, a) => a.findIndex(h => h.name === item.name) === i)
    .slice(0, 5)

  const insight = getInsight(history, tipIndex)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      <LoadingState />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', paddingBottom: '96px' }}>

      {/* ── Nav ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '52px',
        background: '#fff', borderBottom: '1px solid #E5E1D6',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em' }}>NutriScan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.06em' }}>FSSAI GUIDED</span>
        </div>
      </header>

      <div style={{ padding: '24px 16px 0' }}>

        {/* ── Hero ── */}
        <div style={{ ...show(0), marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            AI food safety scanner
          </p>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>
            Is this food<br />safe for you?
          </h1>
          <p style={{ fontSize: '14px', color: '#6B6760', lineHeight: 1.6 }}>
            Scan the barcode or enter it below. Safety grade in under 5 seconds.
          </p>
        </div>

        {/* ── Install banner (Android Chrome only) ── */}
        {installEvt && !installed && (
          <div style={{ ...show(40), marginBottom: '12px' }}>
            <div style={{
              background: '#fff', border: '1px solid #E5E1D6', borderRadius: '12px',
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <img src="/icon-192.png" alt="NutriScan" style={{ width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', margin: '0 0 1px 0' }}>Add to Home Screen</p>
                <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>Open instantly like any app — no Play Store needed</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => setInstallEvt(null)}
                  style={{ background: 'none', border: 'none', color: '#A8A29E', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                >×</button>
                <button
                  onClick={handleInstall}
                  style={{
                    background: '#16A34A', border: 'none', borderRadius: '8px',
                    color: '#fff', fontSize: '12px', fontWeight: 700, padding: '7px 12px',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >Install</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Primary CTA ── */}
        <div style={{ ...show(60), marginBottom: '10px' }}>
          <button
            onClick={() => navigate('/scan')}
            style={{
              width: '100%', height: '52px', border: 'none', borderRadius: '12px',
              background: '#16A34A', color: '#fff',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 120ms, transform 100ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
            Check if it's safe
          </button>
        </div>

        {/* ── Barcode input ── */}
        <div style={{ ...show(100), marginBottom: '24px' }}>
          <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: '8px', animation: shake ? 'shake 0.5s ease both' : 'none' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff', borderRadius: '12px', padding: '0 12px', height: '48px',
                border: `1px solid ${shake ? '#DC2626' : focused ? '#16A34A' : '#E5E1D6'}`,
                transition: 'border-color 150ms',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <rect x="2"    y="4" width="3"   height="16" rx="0.5" fill={focused ? '#16A34A' : '#A8A29E'}/>
                  <rect x="7"    y="4" width="1.5" height="16" rx="0.5" fill={focused ? '#16A34A' : '#A8A29E'}/>
                  <rect x="10.5" y="4" width="2.5" height="16" rx="0.5" fill={focused ? '#16A34A' : '#A8A29E'}/>
                  <rect x="15"   y="4" width="1.5" height="16" rx="0.5" fill={focused ? '#16A34A' : '#A8A29E'}/>
                  <rect x="18.5" y="4" width="3"   height="16" rx="0.5" fill={focused ? '#16A34A' : '#A8A29E'}/>
                </svg>
                <input
                  ref={inputRef}
                  type="text" inputMode="numeric"
                  placeholder="or type barcode number"
                  value={barcode}
                  onChange={e => { setBarcode(e.target.value.replace(/\D/g, '')); setError(null) }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  disabled={loading}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1C1917', fontSize: '14px' }}
                />
                {barcode && (
                  <button type="button" onClick={() => setBarcode('')}
                    style={{ background: '#E5E1D6', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6760', fontSize: '12px', flexShrink: 0 }}>
                    ×
                  </button>
                )}
              </div>
              <button type="submit" disabled={!barcode || loading}
                style={{
                  width: '48px', height: '48px', flexShrink: 0, border: 'none', borderRadius: '12px',
                  background: barcode && !loading ? '#1C1917' : '#E5E1D6',
                  color: barcode && !loading ? '#fff' : '#A8A29E',
                  fontSize: '18px', fontWeight: 700,
                  cursor: barcode && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 150ms',
                }}>
                {loading
                  ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 600ms linear infinite' }} />
                  : '→'}
              </button>
            </div>
            {(error || (shake && barcode)) && (
              <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px', paddingLeft: '2px' }}>
                {error || 'Enter a valid 8–14 digit barcode.'}
              </p>
            )}
          </form>
        </div>

        {/* ── Grade System ── */}
        <div style={{ ...show(140), marginBottom: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E1D6', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>How we grade</span>
              <span style={{ fontSize: '11px', color: '#A8A29E' }}>Tap to learn</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.entries(GRADE_DESC).map(([g, info]) => (
                <div key={g} style={{ flex: 1, position: 'relative' }}
                  onClick={e => { e.stopPropagation(); setTooltip(tooltip === g ? null : g) }}>
                  <div style={{
                    aspectRatio: '1', borderRadius: '8px', cursor: 'pointer',
                    background: tooltip === g ? info.color : info.bg,
                    border: `1px solid ${tooltip === g ? info.color : '#E5E1D6'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms',
                    transform: tooltip === g ? 'scale(1.07)' : 'scale(1)',
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: tooltip === g ? '#fff' : info.color, transition: 'color 150ms' }}>{g}</span>
                  </div>
                  {tooltip === g && (
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                      background: '#1C1917', color: '#fff', fontSize: '12px', lineHeight: 1.45,
                      borderRadius: '10px', padding: '10px 12px', width: '160px', zIndex: 99,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      animation: 'tipIn 160ms ease-out both', pointerEvents: 'none',
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px', color: g === 'A' ? '#86EFAC' : g === 'E' ? '#FCA5A5' : '#FDE68A' }}>Grade {g}</div>
                      {info.text}
                      <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#1C1917', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Insight ── */}
        <div style={{ ...show(180), marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E1D6', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>{insight.label}</p>
              <p style={{ fontSize: '13px', color: '#1C1917', lineHeight: 1.55 }}>{insight.text}</p>
            </div>
          </div>
        </div>

        {/* ── Recent scans ── */}
        {history5.length > 0 && (
          <div style={show(220)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>Recent scans</span>
              <span style={{ fontSize: '12px', color: '#A8A29E' }}>{history5.length} products</span>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E1D6', overflow: 'hidden' }}>
              {history5.map((item, i) => {
                const vg = VERDICT_GRADE[item.verdict] || VERDICT_GRADE.moderation
                const letter = (item.name || '?').charAt(0).toUpperCase()
                const bg = avatarColor(item.name)
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderBottom: i < history5.length - 1 ? '1px solid #F0EDE6' : 'none',
                    animation: `fadeUp 300ms cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both`,
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.image_url ? '#F7F4EE' : bg }}>
                      {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#fff', fontSize: '17px', fontWeight: 700 }}>{letter}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', margin: '0 0 1px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>{item.brand || 'No brand'}</p>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: vg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{vg.grade}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {history5.length === 0 && (
          <div style={{ ...show(220), paddingTop: '8px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E1D6', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#F7F4EE', border: '1px solid #E5E1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                  <line x1="7" y1="12" x2="17" y2="12"/>
                </svg>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '6px' }}>Your first scan changes how you shop</p>
              <p style={{ fontSize: '13px', color: '#A8A29E', lineHeight: 1.55 }}>Most people are surprised by what they find.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
