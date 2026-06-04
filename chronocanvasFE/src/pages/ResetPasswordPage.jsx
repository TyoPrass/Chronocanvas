import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirm) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.put(`/resetpassword/${token}`, {
        password: form.password
      });
      
      setMessage(response.data.message || 'Password berhasil direset. Mengalihkan ke halaman login...');
      
      // Arahkan ke halaman login setelah beberapa detik
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengatur ulang password.');
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
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Buat Password Baru
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
          Masukkan password baru Anda di bawah ini.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-h)' }}>
              Password Baru
            </label>
            <input
              type="password"
              required
              placeholder="Min. 6 karakter"
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-h)' }}>
              Konfirmasi Password
            </label>
            <input
              type="password"
              required
              placeholder="Ulangi password baru"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
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

          <button type="submit" disabled={isLoading} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '24px', color: 'var(--text-muted)' }}>
          <Link to="/signin" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Kembali ke Halaman Login
          </Link>
        </p>
      </div>
    </div>
  );
}
