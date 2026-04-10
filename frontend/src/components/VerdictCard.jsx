import { useEffect, useState } from 'react'
import { VERDICT_CONFIG } from '../utils/verdictLogic'

export default function VerdictCard({ verdict = 'moderation', headline, hindiVerdict, profileNote }) {
  const [visible, setVisible] = useState(false)
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.moderation

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 32px ${cfg.glow}`,
        borderRadius: '20px',
        padding: '24px',
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease-out',
      }}
    >
      {/* Verdict dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: cfg.color,
            boxShadow: `0 0 8px ${cfg.color}`,
            flexShrink: 0,
            animation: visible ? 'pop 300ms cubic-bezier(0.34,1.56,0.64,1) 400ms both' : 'none',
          }}
        />
        <span
          style={{
            color: cfg.color,
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Headline */}
      {headline && (
        <p
          style={{
            color: cfg.color,
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: 1.5,
            margin: '0 0 8px 0',
            opacity: 0.9,
          }}
        >
          {headline}
        </p>
      )}

      {/* Hindi verdict */}
      {hindiVerdict && (
        <p
          style={{
            color: cfg.color,
            fontSize: '13px',
            fontWeight: 400,
            opacity: 0.65,
            margin: 0,
          }}
        >
          {hindiVerdict}
        </p>
      )}
    </div>
  )
}
