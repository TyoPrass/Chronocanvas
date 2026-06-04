const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;

  // Jika ada BREVO_API_KEY, gunakan Brevo HTTP API (tidak perlu IP whitelist)
  if (process.env.BREVO_API_KEY) {
    // Gunakan fetch untuk memanggil Brevo API secara langsung
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.FROM_NAME || "Chronocanvas",
          email: process.env.FROM_EMAIL,
        },
        to: [{ email: options.email }],
        subject: options.subject,
        textContent: options.message,
        htmlContent: options.html || options.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      throw new Error("Gagal mengirim email melalui Brevo API");
    }

    console.log("Email sent via Brevo API");
    return;
  }

  // Fallback: Gunakan SMTP (untuk lokal / jika IP sudah di-whitelist)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent via SMTP: %s", info.messageId);
};

module.exports = sendEmail;
