import { useNavigate } from 'react-router-dom'
import HealthProfileForm from '../components/HealthProfileForm'

export default function Profile() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', paddingBottom: '100px' }}>

      <header style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px', height: '52px',
        background: '#fff', borderBottom: '1px solid #E5E1D6',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
          Back
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>Health Profile</span>
      </header>

      <div style={{ padding: '24px 16px 16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Personalisation
        </p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Tell us about yourself
        </h2>
        <p style={{ fontSize: '13px', color: '#6B6760', lineHeight: 1.55, marginBottom: '24px' }}>
          Every scan is tailored to your conditions. Alerts are shown when a product conflicts with your health profile.
        </p>
      </div>

      <HealthProfileForm onSave={() => navigate(-1)} />

      <p style={{ color: '#A8A29E', fontSize: '11px', textAlign: 'center', padding: '20px 20px 0', letterSpacing: '0.03em' }}>
        Stored locally on your device. Never shared or uploaded.
      </p>
    </div>
  )
}
