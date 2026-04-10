import { useState } from 'react'
import { saveHealthProfile, getHealthProfile } from '../utils/api'

const GROUPS = [
  {
    label: 'Health Conditions',
    items: [
      { key: 'diabetic',      label: 'Diabetic',                    desc: 'Monitors sugar content closely' },
      { key: 'heartPatient',  label: 'Heart Patient / Hypertension', desc: 'Flags high sodium and saturated fat' },
    ],
  },
  {
    label: 'Dietary Restrictions',
    items: [
      { key: 'vegan',             label: 'Vegan',              desc: 'Alerts for animal-derived ingredients' },
      { key: 'glutenFree',        label: 'Gluten Intolerance', desc: 'Warns about wheat, barley, rye' },
      { key: 'lactoseIntolerant', label: 'Lactose Intolerant', desc: 'Flags dairy ingredients' },
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

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', cursor: 'pointer',
        borderBottom: '1px solid #F5F2EB',
      }}
    >
      <div style={{ flex: 1, paddingRight: '16px' }}>
        <p style={{ color: checked ? '#1A1916' : '#6B6760', fontSize: '14px', fontWeight: checked ? 600 : 400, margin: '0 0 2px 0', transition: 'all 150ms' }}>
          {label}
        </p>
        {desc && (
          <p style={{ color: '#C5C2BA', fontSize: '12px', margin: 0 }}>
            {desc}
          </p>
        )}
      </div>

      <div style={{
        width: '44px', height: '26px', borderRadius: '13px',
        background: checked ? '#16A34A' : '#E8E4D8',
        position: 'relative', flexShrink: 0,
        transition: 'background 200ms ease',
      }}>
        <div style={{
          position: 'absolute', top: '3px',
          left: checked ? '21px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

export default function HealthProfileForm({ onSave }) {
  const [profile, setProfile] = useState(getHealthProfile)
  const [saved, setSaved] = useState(false)

  function toggle(key) {
    setProfile(p => ({ ...p, [key]: !p[key] }))
    setSaved(false)
  }

  function handleSave() {
    saveHealthProfile(profile)
    setSaved(true)
    if (onSave) onSave(profile)
  }

  return (
    <div style={{ padding: '0 20px' }}>
      {GROUPS.map((group, gi) => (
        <div key={group.label} style={{ marginBottom: '24px' }}>
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E4D8', borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F2EB', background: '#FAFAF8' }}>
              <p style={{ color: '#9B9890', fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', margin: 0 }}>
                {group.label}
              </p>
            </div>
            <div style={{ padding: '0 16px' }}>
              {group.items.map((item, ii) => (
                <div key={item.key} style={{ borderBottom: ii < group.items.length - 1 ? '1px solid #F5F2EB' : 'none' }}>
                  <Toggle
                    checked={!!profile[item.key]}
                    onChange={() => toggle(item.key)}
                    label={item.label}
                    desc={item.desc}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        style={{
          width: '100%', height: '52px',
          background: saved ? '#F0FDF4' : '#16A34A',
          border: `1.5px solid ${saved ? '#BBF7D0' : 'transparent'}`,
          borderRadius: '14px',
          color: saved ? '#16A34A' : '#FFFFFF',
          fontSize: '15px', fontWeight: 700,
          cursor: 'pointer', marginBottom: '8px',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#15803D' }}
        onMouseLeave={e => { if (!saved) e.currentTarget.style.background = '#16A34A' }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {saved ? '✓ Profile Saved' : 'Save Profile'}
      </button>
    </div>
  )
}
