import { useApp, useT } from '../../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const t = useT();

  const tabs = [
    { id: 'home', icon: '🏠', label: t('home') },
    { id: 'weather', icon: '🌦️', label: t('weather') },
    { id: 'ai', icon: '🎤', label: t('aiChat'), center: true },
    { id: 'savings', icon: '💰', label: t('savings') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0,
      left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px',
      background: '#FFFFFF',
      borderTop: '2px solid #E8F5E9',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
      display: 'flex', alignItems: 'flex-end',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100, height: 'calc(64px + env(safe-area-inset-bottom))'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        if (tab.center) {
          return (
            <button
              key={tab.id}
              data-testid="nav-ai"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end',
                paddingBottom: '10px', border: 'none', background: 'none',
                cursor: 'pointer', position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute', bottom: '14px',
                width: '56px', height: '56px', borderRadius: '28px',
                background: isActive
                  ? 'linear-gradient(135deg, #B71C1C, #C62828)'
                  : 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                border: '3px solid #FFFFFF',
                boxShadow: isActive
                  ? '0 4px 20px rgba(198,40,40,0.5)'
                  : '0 4px 20px rgba(27,94,32,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                transition: 'all 300ms cubic-bezier(0.34,1.56,0.64,1)'
              }}>
                {isActive ? '🤖' : '🎤'}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: isActive ? 700 : 400,
                color: isActive ? '#1B5E20' : '#9E9E9E',
                marginTop: '4px', lineHeight: 1
              }}>
                {isActive ? t('aiChat') : tab.label}
              </span>
            </button>
          );
        }
        return (
          <button
            key={tab.id}
            data-testid={`nav-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10px', border: 'none', background: 'none',
              cursor: 'pointer', position: 'relative',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, width: '28px', height: '4px',
                borderRadius: '0 0 4px 4px',
                background: 'linear-gradient(to right, #1B5E20, #4CAF50)'
              }} />
            )}
            <span style={{
              fontSize: '24px', marginBottom: '4px',
              opacity: isActive ? 1 : 0.45,
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 200ms ease'
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: '11px', lineHeight: 1,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? '#1B5E20' : '#9E9E9E'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
