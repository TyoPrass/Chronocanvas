import { Link } from 'react-router-dom';
import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';

/**
 * NotFoundPage — Halaman 404
 */
export default function NotFoundPage() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '80px', fontWeight: '900', color: 'var(--primary)', lineHeight: '1', marginBottom: '16px' }}>
            404
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
            Halaman Tidak Ditemukan
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
          </p>
          <Link to="/" className="btn btn--primary btn--lg">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
