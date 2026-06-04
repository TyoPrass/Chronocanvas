import Navbar from '../components/layouts/navbar';
import Footer from '../components/layouts/footer';
import Hero from '../components/sections/hero';

/**
 * LandingPage — Halaman utama / Index
 * Menampilkan Hero section dengan CTA ke Generator
 */
export default function LandingPage() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
