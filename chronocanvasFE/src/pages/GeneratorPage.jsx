import { useState } from 'react';
import api from '../utils/api';

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
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Share: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.59003 13.51L15.42 17.49M15.41 6.51001L8.59003 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Hourglass: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 4H6C6 4 6 7 7 9C8 11 12 12 12 12C12 12 8 13 7 15C6 17 6 20 6 20H18C18 20 18 17 17 15C16 13 12 12 12 12C12 12 16 11 17 9C18 7 18 4 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ImagePlaceholder: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');
    setGeneratedImage(null);

    try {
      const response = await api.post('/history/generate', { prompt });
      if (response.data.success) {
        // Bangun URL gambar dari imageUrl yang dikembalikan backend
        // const imageUrl = `http://localhost:3000${response.data.data.imageUrl}`; // Local
        const imageUrl = response.data.data.imageUrl; // Cloudinary URL (sudah lengkap)
        setGeneratedImage(imageUrl);
      } else {
        setError(response.data.message || 'Gagal membuat gambar');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login ulang.');
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan saat menghubungi server AI. Pastikan server Flask dan Express sudah berjalan.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `chronocanvas_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' }}>
          Generate Ilustrasi Sejarah
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
          Buat visualisasi peristiwa sejarah Indonesia dengan AI. Deskripsikan momen bersejarah yang ingin Anda gambarkan.
        </p>
      </div>

      {/* Workspace */}
      <div style={{ display: 'flex', gap: '32px', flex: 1 }}>

        {/* Controls Panel */}
        <div style={{
          width: '380px',
          background: 'white',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>

          {/* Input Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Deskripsi Peristiwa Sejarah</label>
              <div style={{ color: 'var(--text-muted)', cursor: 'help' }} title="Deskripsikan peristiwa sejarah Indonesia yang ingin divisualisasikan. Semakin detail, semakin bagus hasilnya.">
                <Icons.Info />
              </div>
            </div>
            <textarea
              placeholder="Contoh: Lukisan sejarah proklamasi kemerdekaan Indonesia 17 Agustus 1945, Soekarno membacakan teks proklamasi, suasana haru dan semangat, gaya lukisan cat minyak..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: '100%',
                height: '200px',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                color: 'var(--text-h)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Tips */}
          <div style={{
            background: 'var(--primary-bg)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid var(--primary-border)',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              💡 Tips untuk hasil terbaik:
            </p>
            <ul style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.8', paddingLeft: '16px' }}>
              <li>Sebutkan <b>era/periode</b> sejarah (misal: masa Majapahit)</li>
              <li>Deskripsikan <b>suasana dan emosi</b> yang diinginkan</li>
              <li>Tambahkan <b>gaya visual</b> (lukisan cat minyak, ilustrasi, dll)</li>
            </ul>
          </div>

          <div style={{ flex: 1 }} />

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#dc2626'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              width: '100%',
              background: isGenerating ? 'var(--primary-light)' : (!prompt.trim() ? '#e5e7eb' : 'var(--primary)'),
              color: (!prompt.trim() && !isGenerating) ? '#9ca3af' : 'white',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: (isGenerating || !prompt.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '16px',
              boxShadow: (!prompt.trim() && !isGenerating) ? 'none' : '0 4px 12px rgba(59, 59, 255, 0.2)'
            }}
          >
            <Icons.Wand />
            {isGenerating ? 'Sedang Membuat Gambar...' : 'Generate Ilustrasi Sejarah'}
          </button>

        </div>

        {/* Preview Panel */}
        <div style={{
          flex: 1,
          background: 'var(--primary-bg)',
          borderRadius: '20px',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Preview Toolbar */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--primary-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>
              <Icons.ImagePlaceholder />
              Pratinjau Output
            </div>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
              <button
                onClick={handleDownload}
                disabled={!generatedImage}
                style={{
                  cursor: generatedImage ? 'pointer' : 'not-allowed',
                  transition: 'color 0.2s',
                  opacity: generatedImage ? 1 : 0.3
                }}
                title="Download gambar"
                onMouseOver={(e) => generatedImage && (e.currentTarget.style.color = 'var(--primary)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Icons.Download />
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(to bottom right, #f8f9ff, #eef0ff)',
            backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(59, 59, 255, 0.05) 2px, transparent 0)',
            backgroundSize: '40px 40px',
            padding: '24px'
          }}>
            {isGenerating ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--primary-light)', marginBottom: '24px', animation: 'pulse 2s infinite', display: 'inline-block' }}>
                  <Icons.Hourglass />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                  Sedang membuat ilustrasi...
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Model AI sedang memproses prompt Anda
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                  Proses ini bisa memakan waktu 30 detik - 2 menit
                </p>

                {/* Progress Bar */}
                <div style={{ width: '240px', height: '6px', background: 'rgba(59, 59, 255, 0.1)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'var(--primary)', borderRadius: '3px', animation: 'progress 2s infinite ease-in-out' }}></div>
                </div>

                <style>{`
                  @keyframes pulse { 0% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0.6; transform: scale(0.95); } }
                  @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
                `}</style>
              </div>
            ) : generatedImage ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={generatedImage}
                  alt="Hasil generate AI"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: '85%',
                height: '80%',
                background: 'rgba(59, 59, 255, 0.05)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(59, 59, 255, 0.3)',
                border: '2px dashed rgba(59, 59, 255, 0.15)',
                gap: '16px'
              }}>
                <Icons.Hourglass />
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Masukkan prompt sejarah dan tekan "Generate" untuk mulai
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
