import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/history');
      if (response.data.success) {
        setHistories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login ulang.');
      } else {
        setError('Gagal memuat riwayat. Pastikan server berjalan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (imageUrl, prompt) => {
    const link = document.createElement('a');
    // Otomatis deteksi: jika URL dari Cloudinary (http), pakai langsung. Jika lokal (/public), tambah awalan sesuai environment.
    const backendUrl = import.meta.env.PROD ? 'https://chronocanvas-ykf9.vercel.app' : 'http://localhost:3000';
    link.href = imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`;
    link.download = `chronocanvas_${prompt.slice(0, 30).replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' }}>
            Riwayat Ilustrasi
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            Koleksi ilustrasi sejarah Indonesia yang telah Anda buat sebelumnya.
          </p>
        </div>
        <button
          onClick={() => navigate('/generate')}
          style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59, 59, 255, 0.2)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          ✨ Buat Baru
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            width: '48px', height: '48px', border: '4px solid var(--primary-bg)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Memuat riwayat...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca'
        }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</p>
          <p style={{ fontSize: '16px', color: '#dc2626', fontWeight: '600' }}>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && histories.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'white', borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <p style={{ fontSize: '64px', marginBottom: '16px' }}>🏛️</p>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', marginBottom: '8px' }}>
            Belum ada ilustrasi
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Mulai buat ilustrasi pertama Anda tentang sejarah Indonesia!
          </p>
          <button
            onClick={() => navigate('/generate')}
            style={{
              background: 'var(--primary)', color: 'white', padding: '14px 28px',
              borderRadius: '12px', fontWeight: '600', fontSize: '15px',
              boxShadow: '0 4px 12px rgba(59, 59, 255, 0.2)', cursor: 'pointer'
            }}
          >
            ✨ Buat Ilustrasi Pertama
          </button>
        </div>
      )}

      {/* History Grid */}
      {!loading && !error && histories.length > 0 && (
        <>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Menampilkan {histories.length} ilustrasi
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {histories.map((item) => (
              <div key={item._id} style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
              >
                {/* Image Thumbnail */}
                <div
                  onClick={() => setSelectedImage(item)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f0f0ff, #e8e9ff)'
                  }}
                >
                  <img
                    // Otomatis deteksi lokal vs Cloudinary, dan menyesuaikan environment
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.PROD ? 'https://chronocanvas-ykf9.vercel.app' : 'http://localhost:3000'}${item.imageUrl}`}
                    alt={item.prompt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px' }}>
                  <p style={{
                    fontSize: '14px', fontWeight: '600', color: '#1A1A2E',
                    marginBottom: '8px', lineHeight: '1.4',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    "{item.prompt}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📅 {formatDate(item.createdAt)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(item.imageUrl, item.prompt); }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'var(--primary-bg)', color: 'var(--primary-dark)',
                        fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#e0e0ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-bg)'}
                    >
                      ⬇ Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '40px', cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px',
              maxWidth: '800px', width: '100%', overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.3)', cursor: 'default'
            }}
          >
            <img
              // Otomatis deteksi lokal vs Cloudinary, dan menyesuaikan environment
              src={selectedImage.imageUrl.startsWith('http') ? selectedImage.imageUrl : `${import.meta.env.PROD ? 'https://chronocanvas-ykf9.vercel.app' : 'http://localhost:3000'}${selectedImage.imageUrl}`}
              alt={selectedImage.prompt}
              style={{ width: '100%', display: 'block' }}
            />
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px' }}>
                "{selectedImage.prompt}"
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                📅 {formatDate(selectedImage.createdAt)}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    background: 'var(--primary)', color: 'white',
                    fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    background: '#f3f4f6', color: '#374151',
                    fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
