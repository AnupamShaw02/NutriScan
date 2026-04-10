export default function AlternativeCard({ alternative, verdict }) {
  if (!alternative?.found || verdict === 'safe') return null

  const { name, brand, image_url, why_better = [] } = alternative

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1C1C1C',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background 150ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#3D3D3D'
        e.currentTarget.style.background = '#1A1A1A'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1C1C1C'
        e.currentTarget.style.background = '#111111'
      }}
    >
      {/* Product image */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '8px',
        background: '#1A1A1A', flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {image_url
          ? <img src={image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '20px' }}>🛒</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#F4F4F5', fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </p>
        {brand && (
          <p style={{ color: '#71717A', fontSize: '12px', margin: '0 0 6px 0' }}>{brand}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {why_better.slice(0, 3).map((reason, i) => (
            <span key={i} style={{ color: '#4ADE80', fontSize: '11px', fontWeight: 500 }}>
              ✓ {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Chevron */}
      <span style={{ color: '#3F3F46', fontSize: '16px', flexShrink: 0 }}>›</span>
    </div>
  )
}
