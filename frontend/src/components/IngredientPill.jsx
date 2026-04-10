import { useState } from 'react'

const FLAG_COLOR = {
  ok:      '#22C55E',
  warning: '#FACC15',
  caution: '#F87171',
}

export default function IngredientPill({ name, plainName, explanation, flag = 'ok', source }) {
  const [expanded, setExpanded] = useState(false)
  const dotColor = FLAG_COLOR[flag] || FLAG_COLOR.ok

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        borderBottom: '1px solid #1C1C1C',
        overflow: 'hidden',
        maxHeight: expanded ? '160px' : '44px',
        transition: 'max-height 250ms cubic-bezier(0.16,1,0.3,1)',
        cursor: 'pointer',
      }}
    >
      {/* Collapsed row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', minHeight: '44px' }}>
        {/* Flag dot */}
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: dotColor, flexShrink: 0,
          boxShadow: `0 0 6px ${dotColor}55`,
        }} />

        {/* Name */}
        <span style={{ color: '#F4F4F5', fontSize: '13px', flex: 1 }}>
          {expanded && plainName ? plainName : name}
        </span>

        {/* Chevron */}
        <span style={{
          color: '#3F3F46', fontSize: '12px',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms ease',
        }}>
          ▾
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 0 12px 18px' }}>
          {explanation && (
            <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 6px 0', lineHeight: 1.5 }}>
              {explanation}
            </p>
          )}
          {source && (
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#3F3F46',
              margin: 0,
            }}>
              Source: {source}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
