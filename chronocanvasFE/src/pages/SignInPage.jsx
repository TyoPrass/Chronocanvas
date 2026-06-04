import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * SignInPage — Halaman Login
 */
export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/login', form);
      const data = response.data;

      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      navigate('/generate');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
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
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '16px' }}>
        <Link
          to="/"
          id="signin-back"
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
        maxWidth: '420px',
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
          Selamat Datang Kembali
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Masuk ke akun ChronoCanvas Anda
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-h)' }}>
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              required
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1.5px solid var(--border)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none', background: 'white',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--primary)', textDecoration: 'none' }}>
                Lupa Password?
              </Link>
            </div>
            <input
              id="signin-password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1.5px solid var(--border)', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none', background: 'white',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button id="signin-submit" type="submit" disabled={isLoading} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '24px', color: 'var(--text-muted)' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
