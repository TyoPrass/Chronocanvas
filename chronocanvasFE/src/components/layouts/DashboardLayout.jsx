import { Link, useNavigate, useLocation } from 'react-router-dom';

const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Wand: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.071 4.92896L16.2426 7.75738M7.75736 16.2426L4.92893 19.0711M19.071 19.0711L16.2426 16.2426M7.75736 7.75738L4.92893 4.92896" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Clear auth
    navigate('/');
  };

  const navItems = [
    { path: '/generate', label: 'Generator', icon: Icons.Wand },
    { path: '/history', label: 'History', icon: Icons.Clock },
    { path: '/profile', label: 'Profile', icon: Icons.User },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '8px' }}>
          <div style={{ color: 'var(--primary)', display: 'flex' }}>
            <Icons.Logo />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>
            ChronoCanvas
          </span>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-light)' }}></div>
          AI Engine Active
        </div>

        {/* Create Button */}
        <button 
          onClick={() => navigate('/generate')}
          style={{
          background: 'var(--primary)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '15px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(59, 59, 255, 0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 59, 255, 0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 59, 255, 0.2)'; }}
        >
          <Icons.Plus />
          <span style={{ textAlign: 'left', lineHeight: '1.2' }}>Create New<br />Illustration</span>
        </button>

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  background: isActive ? 'var(--primary-bg)' : 'transparent', 
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                  borderRadius: '12px', 
                  fontWeight: isActive ? '600' : '500', 
                  fontSize: '15px',
                  textDecoration: 'none',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseOver={(e) => { 
                  if (!isActive) {
                    e.currentTarget.style.background = '#f3f4f6'; 
                    e.currentTarget.style.color = 'var(--text-h)'; 
                  }
                }}
                onMouseOut={(e) => { 
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'; 
                    e.currentTarget.style.color = 'var(--text-muted)'; 
                  }
                }}
              >
                <Icon />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
            color: 'var(--text-muted)', borderRadius: '12px', fontWeight: '500', fontSize: '15px',
            width: '100%', transition: 'background 0.2s', cursor: 'pointer'
          }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Icons.Logout />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
