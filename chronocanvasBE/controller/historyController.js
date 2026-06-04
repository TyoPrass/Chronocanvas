const History = require("../model/history");
const AiConfig = require("../model/aiConfig");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Ambil URL AI server secara dinamis.
 * Prioritas: MongoDB (dari Colab) → .env → default localhost
 */
async function getAiApiUrl() {
  // 1. Prioritas Pertama: Environment Variable (Vercel / .env)
  if (process.env.AI_API_URL) {
    return process.env.AI_API_URL;
  }

  // 2. Prioritas Kedua: Baca dari MongoDB (Auto-register dari Colab)
  try {
    const config = await AiConfig.findOne({ key: "ai_api_url" });
    if (config && config.value) {
      return config.value;
    }
  } catch (err) {
    console.warn("Gagal membaca AI URL dari database:", err.message);
  }

  // 3. Fallback terakhir
  return "http://localhost:5000";
}

exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.userId; // Dari authMiddleware

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt diperlukan" });
    }

    // Ambil URL AI server (otomatis dari Colab via MongoDB)
    const AI_API_URL = await getAiApiUrl();
    console.log(`[AI] Menggunakan AI server: ${AI_API_URL}`);

    const response = await axios.post(`${AI_API_URL}/generate`, {
      prompt: prompt,
    }, {
      timeout: 120000, // 2 menit timeout (Colab bisa lebih lambat)
    });

    if (response.data && response.data.success) {
      const base64Data = response.data.image_base64;

      // ========================================================
      // 1. [VERSI VERCEL / ONLINE] - Simpan ke Cloudinary
      // ========================================================
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64Data}`,
        {
          folder: "chronocanvas",
          public_id: `generated_${userId}_${Date.now()}`,
          resource_type: "image",
        }
      );
      const imageUrl = uploadResult.secure_url;

      // ========================================================
      // 2. [VERSI LOKAL] - Simpan ke hard disk laptop
      // Jika ingin pakai versi ini: Comment/matikan kode versi 1,
      // lalu uncomment/aktifkan kode di bawah ini.
      // (JANGAN pakai versi lokal saat deploy ke Vercel)
      // ========================================================
      // const fileName = `generated_${userId}_${Date.now()}.png`;
      // const publicDir = path.join(__dirname, "..", "public", "generated");
      // if (!fs.existsSync(publicDir)) {
      //   fs.mkdirSync(publicDir, { recursive: true });
      // }
      // const filePath = path.join(publicDir, fileName);
      // fs.writeFileSync(filePath, base64Data, "base64");
      // const imageUrl = `/public/generated/${fileName}`;
      // ========================================================

      const newHistory = await History.create({
        userId,
        prompt,
        imageUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Gambar berhasil dibuat dan disimpan",
        data: newHistory,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Gagal membuat gambar dari model AI",
      });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat membuat gambar",
      error: error.message
    });
  }
};

// Mengambil history HANYA milik user yang sedang login
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Cari history berdasarkan userId dan urutkan dari yang terbaru
    const histories = await History.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: histories.length,
      data: histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat",
    });
  }
};
