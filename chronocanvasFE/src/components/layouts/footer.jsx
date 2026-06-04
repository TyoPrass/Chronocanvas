import { Link } from 'react-router-dom';

const LogoIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8L8 2L14 8L8 14L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Logo */}
        <div className="footer__logo">
          <span className="footer__logo-icon">
            <LogoIcon />
          </span>
          ChronoCanvas
        </div>

        {/* Copyright */}
        <p className="footer__copy">
          © 2024 ChronoCanvas AI. All rights reserved.
        </p>

        {/* Links */}
        <nav className="footer__links" aria-label="Footer navigation">
          <Link to="/privacy" id="footer-privacy">Privacy Policy</Link>
          <Link to="/terms" id="footer-terms">Terms of Service</Link>
          <Link to="/support" id="footer-support">Contact Support</Link>
        </nav>
      </div>
    </footer>
  );
}
