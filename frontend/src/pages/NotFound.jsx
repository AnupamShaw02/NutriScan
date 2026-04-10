import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E8E4D8',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: '14px', padding: 0 }}
        >
          ← Back
        </button>
      </div>

      <div style={{ padding: '64px 20px 0', textAlign: 'center' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: '#FEF9C3', border: '1px solid #FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '32px',
        }}>
          🔍
        </div>

        <h2 style={{
          color: '#1A1916', fontSize: '22px', fontWeight: 800,
          letterSpacing: '-0.02em', marginBottom: '10px',
        }}>
          Product not found
        </h2>
        <p style={{
          color: '#6B6760', fontSize: '14px', lineHeight: 1.6,
          maxWidth: '280px', margin: '0 auto 36px',
        }}>
          This barcode isn't in the Open Food Facts database. Common for newer or regional Indian products.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/scan', { state: { defaultMode: 'image' } })}
            style={{
              width: '100%', height: '52px',
              background: '#16A34A', border: 'none', borderRadius: '14px',
              color: '#FFFFFF', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 130ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
          >
            Scan the Package Label
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', height: '52px',
              background: '#FFFFFF', border: '1.5px solid #E8E4D8', borderRadius: '14px',
              color: '#1A1916', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#D5D0C3'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E4D8'}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
