import { useNavigate, useLocation } from 'react-router-dom'

const LEFT_TABS = [
  {
    id: 'home', path: '/',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={on ? '#16A34A' : 'none'} stroke={on ? '#16A34A' : '#A8A29E'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    label: 'Home',
  },
  {
    id: 'search', path: '/search',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? '#16A34A' : '#A8A29E'} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    label: 'Search',
  },
]

const RIGHT_TABS = [
  {
    id: 'profile', path: '/profile',
    icon: (on) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? '#16A34A' : '#A8A29E'} strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    label: 'Profile',
  },
]

function Tab({ tab, on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2px', padding: '6px 0 8px', background: 'none', border: 'none',
        cursor: 'pointer', transition: 'opacity 150ms',
      }}
    >
      {tab.icon(on)}
      <span style={{ fontSize: '10px', fontWeight: 700, color: on ? '#16A34A' : '#A8A29E', letterSpacing: '0.01em' }}>
        {tab.label}
      </span>
    </button>
  )
}

export default function BottomNav() {
  const navigate       = useNavigate()
  const { pathname }   = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px', zIndex: 100,
      background: '#fff', borderTop: '1px solid #E5E1D6',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>

      {/* Center FAB */}
      <div style={{
        position: 'absolute', top: '-26px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 101, display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <button
          onClick={() => navigate('/scan')}
          aria-label="Scan product"
          style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: '#16A34A', border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(22,163,74,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
        </button>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.01em', marginTop: '3px',
          color: pathname === '/scan' ? '#16A34A' : '#A8A29E',
        }}>
          Scan
        </span>
      </div>

      {/* Tab row: [Home][Search] · · FAB · · [Profile][···] */}
      <div style={{ display: 'flex', alignItems: 'stretch', paddingTop: '6px', paddingBottom: '4px' }}>
        {LEFT_TABS.map(tab => (
          <Tab key={tab.id} tab={tab} on={pathname === tab.path} onClick={() => navigate(tab.path)} />
        ))}

        {/* FAB placeholder — keeps layout symmetric */}
        <div style={{ width: '80px', flexShrink: 0 }} />

        {RIGHT_TABS.map(tab => (
          <Tab key={tab.id} tab={tab} on={pathname === tab.path} onClick={() => navigate(tab.path)} />
        ))}

        {/* Mirror spacer so right side = left side width */}
        <div style={{ flex: 1 }} />
      </div>

    </nav>
  )
}
