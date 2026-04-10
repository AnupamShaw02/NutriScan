const LEVEL_CONFIG = {
  low:       { color: '#22C55E', label: 'Low',       width: '25%' },
  medium:    { color: '#EAB308', label: 'Medium',    width: '55%' },
  high:      { color: '#EF4444', label: 'High',      width: '78%' },
  'very-high': { color: '#DC2626', label: 'Very High', width: '95%' },
}

export default function NutrientBar({ label, value, unit = '', level = 'medium', delay = 0 }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.medium

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ color: '#A1A1AA', fontSize: '13px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#F4F4F5', fontSize: '13px', fontWeight: 500 }}>
            {value}{unit}
          </span>
          <span style={{ color: cfg.color, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div style={{ height: '4px', background: '#1A1A1A', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: cfg.width,
            background: cfg.color,
            borderRadius: '9999px',
            transformOrigin: 'left',
            animation: `fill 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
          }}
        />
      </div>
    </div>
  )
}
