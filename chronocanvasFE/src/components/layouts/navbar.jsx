import { Link } from 'react-router-dom';

const LogoIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8L8 2L14 8L8 14L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <span className="navbar__logo-icon">
            <LogoIcon />
          </span>
          ChronoCanvas
        </Link>

        {/* CTA buttons */}
        <div className="navbar__actions">
          <Link to="/signin" className="btn btn--ghost" id="nav-signin">Sign In</Link>
          <Link to="/register" className="btn btn--primary" id="nav-register">Register</Link>
        </div>

        {/* Mobile toggle */}
        <button className="navbar__mobile-toggle" aria-label="Toggle menu" id="mobile-menu-toggle">
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
