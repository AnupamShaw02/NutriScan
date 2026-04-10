import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>

      <header style={{
        display: 'flex', alignItems: 'center', padding: '0 16px', height: '52px',
        background: '#fff', borderBottom: '1px solid #E5E1D6',
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
          Back
        </button>
      </header>

      <div style={{ padding: '48px 24px 0' }}>

        {/* Icon */}
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Not in our database
        </p>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.025em', marginBottom: '10px' }}>
          Product not found
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6760', lineHeight: 1.6, marginBottom: '32px', maxWidth: '300px' }}>
          This barcode isn't in Open Food Facts yet. This is common for newer or regional Indian products. Try scanning the label photo instead.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/scan', { state: { defaultMode: 'image' } })}
            style={{
              width: '100%', height: '52px', border: 'none', borderRadius: '12px',
              background: '#16A34A', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 120ms, transform 100ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Scan the label instead
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', height: '52px', border: '1px solid #E5E1D6', borderRadius: '12px',
              background: '#fff', color: '#1C1917', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'border-color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#CFC9BC'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E1D6'}
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  )
}
