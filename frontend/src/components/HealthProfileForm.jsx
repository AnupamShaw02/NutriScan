import { useState } from 'react'
import { saveHealthProfile, getHealthProfile } from '../utils/api'

const GROUPS = [
  {
    label: 'Health Conditions',
    items: [
      { key: 'diabetic',     label: 'Diabetic',                     desc: 'Flags high sugar content in every scan' },
      { key: 'heartPatient', label: 'Heart Patient / Hypertension', desc: 'Alerts on high sodium and saturated fat' },
    ],
  },
  {
    label: 'Dietary Restrictions',
    items: [
      { key: 'vegan',             label: 'Vegan',              desc: 'Detects animal-derived ingredients' },
      { key: 'glutenFree',        label: 'Gluten Intolerance', desc: 'Warns about wheat, barley, rye' },
      { key: 'lactoseIntolerant', label: 'Lactose Intolerant', desc: 'Flags dairy and lactose ingredients' },
      { key: 'nutAllergy',        label: 'Nut Allergy',        desc: 'Highlights nut-based ingredients' },
    ],
  },
  {
    label: 'Goals',
    items: [
      { key: 'weightLoss', label: 'Weight Loss', desc: 'Emphasises calorie and fat content' },
    ],
  },
]

function Toggle({ checked, onChange, label, desc, last }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', cursor: 'pointer',
        borderBottom: last ? 'none' : '1px solid #F0EDE6',
        transition: 'background 120ms',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ flex: 1, paddingRight: '16px' }}>
        <p style={{ color: checked ? '#1C1917' : '#6B6760', fontSize: '14px', fontWeight: checked ? 700 : 400, margin: '0 0 2px 0', transition: 'all 150ms' }}>
          {label}
        </p>
        {desc && <p style={{ color: '#A8A29E', fontSize: '12px', margin: 0 }}>{desc}</p>}
      </div>

      {/* Toggle switch */}
      <div style={{
        width: '42px', height: '24px', borderRadius: '12px',
        background: checked ? '#16A34A' : '#E5E1D6',
        position: 'relative', flexShrink: 0,
        transition: 'background 200ms',
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '19px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

export default function HealthProfileForm({ onSave }) {
  const [profile, setProfile] = useState(getHealthProfile)
  const [saved,   setSaved]   = useState(false)

  function toggle(key) { setProfile(p => ({ ...p, [key]: !p[key] })); setSaved(false) }

  function handleSave() {
    saveHealthProfile(profile)
    setSaved(true)
    if (onSave) onSave(profile)
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 4px 8px', margin: 0 }}>
            {group.label}
          </p>
          <div style={{ background: '#fff', border: '1px solid #E5E1D6', borderRadius: '12px', overflow: 'hidden' }}>
            {group.items.map((item, ii) => (
              <Toggle
                key={item.key}
                checked={!!profile[item.key]}
                onChange={() => toggle(item.key)}
                label={item.label}
                desc={item.desc}
                last={ii === group.items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: '8px' }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%', height: '52px', borderRadius: '12px',
            background: saved ? '#F0FDF4' : '#16A34A',
            border: `1px solid ${saved ? '#BBF7D0' : 'transparent'}`,
            color: saved ? '#16A34A' : '#fff',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 200ms',
          }}
          onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#15803D' }}
          onMouseLeave={e => { if (!saved) e.currentTarget.style.background = '#16A34A' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {saved ? 'Profile saved' : 'Save profile'}
        </button>
      </div>
    </div>
  )
}
