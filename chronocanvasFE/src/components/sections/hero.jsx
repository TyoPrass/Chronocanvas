import { Link } from "react-router-dom";

/* SVG Icons */
const SparkleIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
  >
    <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
    <path
      d="M16 14l.75 2.25L19 17l-2.25.75L16 20l-.75-2.25L13 17l2.25-.75L16 14z"
      opacity="0.6"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 8L6.5 11.5L13 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DiagramIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
  >
    <circle cx="10" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="4" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="16" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10 8v4M7 15h2M13 15h-2M8 12l-3 2M12 12l3 2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/* Avatar placeholder component */
function Avatar({ initials, color }) {
  return (
    <div className="hero__avatar">
      <div
        className="hero__avatar-placeholder"
        style={{ background: color, color: "white" }}
      >
        {initials}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        {/* ── Left: Content ── */}
        <div className="hero__content">
          {/* Badge */}
          <div className="hero__badge">
            <span className="badge" id="hero-badge">
              <SparkleIcon />
              AI-Powered Cognitive Clarity
            </span>
          </div>

          {/* Title */}
          <h1 className="hero__title" id="hero-title">
            Ubah Materi
            <br />
            Pembelajaran Menjadi
            <br />
            <span className="hero__title-highlight">Ilustrasi Visual</span>
          </h1>

          {/* Description */}
          <p className="hero__desc">
            Sistem kecerdasan buatan kami mengubah teks rumit sains dan sejarah
            menjadi diagram edukasional yang jernih, meminimalkan beban kognitif
            dan memaksimalkan pemahaman.
          </p>

          {/* CTA Buttons */}
          {/* <div className="hero__actions">
            <Link to="/generator" className="btn btn--primary btn--lg" id="hero-cta-primary">
              Mulai Membuat
            </Link>
          </div> */}

          {/* Social proof */}
          <div className="hero__social-proof">
            <div className="hero__avatars">
              <Avatar initials="A" color="#4f46e5" />
              <Avatar initials="B" color="#7c3aed" />
              <Avatar initials="C" color="#2563eb" />
            </div>
            <span className="hero__social-text">
              Digunakan oleh 10.000+ pelajar &amp; guru
            </span>
          </div>
        </div>

        {/* ── Right: Visual card ── */}
        <div className="hero__visual">
          <div className="hero__card">
            {/* Card header */}
            <div className="hero__card-header">
              <div className="hero__card-title-row">
                <div className="hero__card-icon">
                  <DiagramIcon />
                </div>
                <span className="hero__card-label">Photosynthesis Process</span>
              </div>
              <div className="hero__card-dots">
                <span />
                <span />
                <span />
              </div>
            </div>

            {/* Card illustration */}
            <div className="hero__card-image">
              <div className="hero__card-illustration">
                <div className="photo-illustration">
                  <div className="photo-plant">🌱</div>
                  <div className="photo-arrow" />
                  <div className="photo-block" />
                </div>
              </div>
            </div>

            {/* Prompt bar */}
            <div className="hero__card-prompt">
              <span className="hero__card-prompt-text">
                "Generate a diagram showing how plants convert sunlight into
                ener...
              </span>
              <div className="hero__card-check">
                <CheckIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
