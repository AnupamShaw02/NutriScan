import { useEffect, useState } from 'react'

const STEPS = [
  'Looking up product…',
  'Reading ingredients…',
  'Running AI analysis…',
]

export default function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 950)
    const t2 = setTimeout(() => setStep(2), 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 24px 48px', textAlign: 'center',
      background: '#F5F2EB', minHeight: '100vh',
    }}>
      {/* Green spinner */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        border: '3px solid #DCFCE7', borderTopColor: '#16A34A',
        marginBottom: '28px',
        animation: 'spin 700ms linear infinite',
      }} />

      <h2 style={{
        color: '#1A1916', fontSize: '20px', fontWeight: 800,
        letterSpacing: '-0.02em', marginBottom: '8px',
      }}>
        Analysing your product
      </h2>
      <p style={{ color: '#9B9890', fontSize: '13px', marginBottom: '28px' }}>
        Usually takes 3–6 seconds
      </p>

      {/* Step list */}
      <div style={{
        width: '100%', maxWidth: '280px',
        background: '#FFFFFF', border: '1px solid #E8E4D8',
        borderRadius: '16px', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              animation: i <= step ? 'slideUp 300ms ease-out both' : 'none',
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#16A34A' : (active ? '#DCFCE7' : '#F5F2EB'),
                border: active ? '2px solid #16A34A' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{
                color: done ? '#9B9890' : (active ? '#1A1916' : '#C5C2BA'),
                fontSize: '13px', fontWeight: active ? 600 : 400,
              }}>
                {s}
              </span>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
