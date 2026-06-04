import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const ArrowLeftIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
  >
    <path
      d="M12 4L6 10L12 16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/forgotpassword", { email });
      setMessage(
        response.data.message ||
          "Tautan reset password telah dikirim ke email Anda.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", marginBottom: "16px" }}>
        <Link
          to="/signin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
            padding: "4px 0",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <ArrowLeftIcon />
          Kembali ke Login
        </Link>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h1
          style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}
        >
          Lupa Password?
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          Masukkan email Anda yang terdaftar, kami akan mengirimkan tautan untuk
          membuat password baru.
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#ef4444",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "6px",
                color: "var(--text-h)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid var(--border)",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                background: "white",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn--primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Mengirim..." : "Kirim Tautan"}
          </button>
        </form>
      </div>
    </div>
  );
}
