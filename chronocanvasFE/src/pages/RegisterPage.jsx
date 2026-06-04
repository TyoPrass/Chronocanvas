import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * RegisterPage — Halaman Registrasi
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirm) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/register', {
        username: form.name,
        email: form.email,
        password: form.password
      });

      // Registrasi sukses, arahkan ke login
      navigate('/signin');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid var(--border)', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none', background: 'white',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: '600',
    marginBottom: '6px', color: 'var(--text-h)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Tombol kembali — di luar card */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '16px' }}>
        <Link
          to="/"
          id="register-back"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            padding: '4px 0',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeftIcon />
          Kembali ke Beranda
        </Link>
      </div>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: '700', fontSize: '18px', color: 'var(--text-h)',
          marginBottom: '32px', textDecoration: 'none',
        }}>
          <span style={{
            width: '28px', height: '28px', background: 'var(--primary)',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: '14px',
          }}>✦</span>
          ChronoCanvas
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Buat Akun Baru
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Bergabung dengan 10.000+ pelajar &amp; guru
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nama Lengkap</label>
            <input id="register-name" type="text" required placeholder="Nama Anda"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input id="register-email" type="email" required placeholder="nama@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Password</label>
            <input id="register-password" type="password" required placeholder="Min. 8 karakter"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Konfirmasi Password</label>
            <input id="register-confirm" type="password" required placeholder="Ulangi password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button id="register-submit" type="submit" disabled={isLoading} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '24px', color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link to="/signin" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
