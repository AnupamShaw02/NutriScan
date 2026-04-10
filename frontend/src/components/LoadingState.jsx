import { useEffect, useState } from 'react'

const STEPS = [
  { label: 'Finding product in 40M+ database',  sub: 'Open Food Facts + regional sources' },
  { label: 'Decoding the ingredient list',        sub: 'E-numbers, additives, allergens' },
  { label: 'Running AI safety analysis',          sub: 'Cross-checking WHO and FSSAI limits' },
  { label: 'Personalising for your profile',      sub: 'Applying your health conditions' },
]

export default function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900)
    const t2 = setTimeout(() => setStep(2), 1900)
    const t3 = setTimeout(() => setStep(3), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '72px 24px 48px', textAlign: 'center',
      background: '#F7F4EE', minHeight: '100vh',
    }}>

      {/* Spinner */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '2.5px solid #E5E1D6', borderTopColor: '#16A34A',
        marginBottom: '32px',
        animation: 'spin 700ms linear infinite',
      }} />

      <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Analysing
      </p>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.025em', marginBottom: '6px' }}>
        Running {STEPS.length} checks
      </h2>
      <p style={{ fontSize: '13px', color: '#A8A29E', marginBottom: '32px' }}>
        Usually 3–6 seconds
      </p>

      {/* Steps */}
      <div style={{
        width: '100%', maxWidth: '300px',
        background: '#fff', border: '1px solid #E5E1D6',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        {STEPS.map((s, i) => {
          const done   = i < step
          const active = i === step
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px',
              borderBottom: i < STEPS.length - 1 ? '1px solid #F0EDE6' : 'none',
              opacity: i > step ? 0.4 : 1,
              transition: 'opacity 300ms',
            }}>
              {/* Status indicator */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#16A34A' : active ? '#F0FDF4' : '#F7F4EE',
                border: active ? '2px solid #16A34A' : done ? 'none' : '1px solid #E5E1D6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 300ms',
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {active && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', animation: 'spin 1s linear infinite' }} />
                )}
              </div>

              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{
                  fontSize: '13px', fontWeight: active ? 700 : 400,
                  color: done ? '#A8A29E' : active ? '#1C1917' : '#A8A29E',
                  margin: '0 0 1px 0', transition: 'all 200ms',
                }}>
                  {s.label}
                </p>
                {active && (
                  <p style={{ fontSize: '11px', color: '#A8A29E', margin: 0, animation: 'fadeUp 200ms ease both' }}>
                    {s.sub}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
