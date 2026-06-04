const { verifyToken } = require("../config/jws");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau sudah expired",
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada middleware",
    });
  }
};

module.exports = authMiddleware;
