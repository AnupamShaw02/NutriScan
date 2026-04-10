import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? '#16A34A' : 'none'}
        stroke={active ? '#16A34A' : '#9B9890'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    id: 'search',
    path: '/search',
    label: 'Search',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#16A34A' : '#9B9890'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#16A34A' : '#9B9890'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px', zIndex: 100,
      background: '#FFFFFF', borderTop: '1px solid #E8E4D8',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* FAB — sits above the nav bar */}
      <div style={{
        position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 101,
      }}>
        <button
          onClick={() => navigate('/scan')}
          style={{
            width: '58px', height: '58px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A, #0D9488)',
            border: '3px solid #FFFFFF',
            boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 180ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 150ms',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(22,163,74,0.3)' }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,163,74,0.45)' }}
          onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(22,163,74,0.3)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,163,74,0.45)' }}
          aria-label="Scan product"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
        </button>
        <p style={{
          color: pathname === '/scan' ? '#16A34A' : '#9B9890',
          fontSize: '10px', fontWeight: 600, textAlign: 'center',
          marginTop: '4px', letterSpacing: '0.01em',
        }}>
          Scan
        </p>
      </div>

      {/* Regular tabs — split around the FAB */}
      <div style={{ display: 'flex', paddingTop: '4px' }}>
        {/* Left tabs */}
        {TABS.slice(0, 2).map(tab => {
          const active = pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end',
                gap: '3px', padding: '8px 0 10px',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: '10px', fontWeight: active ? 700 : 400,
                color: active ? '#16A34A' : '#9B9890',
              }}>
                {tab.label}
              </span>
              {/* Active indicator dot */}
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: active ? '#16A34A' : 'transparent',
                marginTop: '1px',
                transition: 'background 200ms',
              }} />
            </button>
          )
        })}

        {/* Center spacer for FAB */}
        <div style={{ width: '72px', flexShrink: 0 }} />

        {/* Right tab */}
        {TABS.slice(2).map(tab => {
          const active = pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end',
                gap: '3px', padding: '8px 0 10px',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: '10px', fontWeight: active ? 700 : 400,
                color: active ? '#16A34A' : '#9B9890',
              }}>
                {tab.label}
              </span>
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: active ? '#16A34A' : 'transparent',
                marginTop: '1px', transition: 'background 200ms',
              }} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
