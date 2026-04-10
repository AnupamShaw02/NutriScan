import { useNavigate } from 'react-router-dom'
import HealthProfileForm from '../components/HealthProfileForm'

export default function Profile() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', background: '#FFFFFF', borderBottom: '1px solid #E8E4D8',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: '#6B6760',
            cursor: 'pointer', fontSize: '14px', padding: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ color: '#1A1916', fontSize: '15px', fontWeight: 600 }}>Health Profile</span>
      </div>

      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{
          background: '#DCFCE7', borderRadius: '16px',
          padding: '16px', marginBottom: '24px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🎯</span>
          <div>
            <p style={{ color: '#16A34A', fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>
              Personalised Scanning
            </p>
            <p style={{ color: '#1A5E30', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              Every scan is tailored to your health profile — alerts are shown when a product conflicts with your conditions.
            </p>
          </div>
        </div>
      </div>

      <HealthProfileForm onSave={() => navigate(-1)} />

      <p style={{
        color: '#C5C2BA', fontSize: '11px', textAlign: 'center',
        padding: '20px 20px 0', letterSpacing: '0.04em',
      }}>
        Stored locally on your device. Never shared.
      </p>
    </div>
  )
}
