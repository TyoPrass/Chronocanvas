const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const historyRoutes = require("./routes/historyRoutes");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Limit diperbesar untuk menerima base64 besar

// Sajikan folder public agar frontend bisa mengakses gambar
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api", userRoutes);
app.use("/api", historyRoutes);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// Route dasar untuk mengecek apakah server jalan
app.get("/", (req, res) => {
  res.send("Chronocanvas Backend is running on Vercel! 🚀");
});

// Hanya jalankan app.listen saat di lokal, BUKAN di Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di http://${HOST}:${PORT}`);
  });
}

// WAJIB UNTUK VERCEL: Export app agar bisa dibaca oleh Vercel Serverless
module.exports = app;
