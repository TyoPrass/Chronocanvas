export default function ProfilePage() {
  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' }}>
          Profil Saya
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
          Kelola informasi akun dan pengaturan profil Anda.
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        maxWidth: '800px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary-bg)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: '700'
          }}>
            U
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A2E', marginBottom: '4px' }}>User ChronoCanvas</h2>
            <p style={{ color: 'var(--text-muted)' }}>user@chronocanvas.com</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', marginBottom: '16px' }}>Statistik Penggunaan</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Total Generate</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>24</p>
              </div>
              <div style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Sisa Kuota</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>76</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
