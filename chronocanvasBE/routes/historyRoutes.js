const express = require("express");
const router = express.Router();
const historyController = require("../controller/historyController");
const authMiddleware = require("../middleware/authMiddleware");

// Route untuk membuat gambar menggunakan AI
router.post("/history/generate", authMiddleware, historyController.generateImage);

// Route untuk mengambil riwayat gambar (Hanya menampilkan milik user yang login)
router.get("/history", authMiddleware, historyController.getUserHistory);

module.exports = router;
