const User = require("../model/user");
const { generateToken } = require("../config/jws");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, dan password harus diisi",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah terdaftar",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // PROTEKSI: Pastikan user hanya bisa mengedit profilnya sendiri
    if (req.params.id !== req.userId) {
      return res.status(403).json({ success: false, message: "Akses ditolak. Anda hanya bisa mengubah profil Anda sendiri." });
    }

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username baru harus diisi" });
    }

    // Cari user terlebih dahulu
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    // Hanya ubah username
    user.username = username;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Username berhasil diupdate",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (error) {
    // Tangani error duplicate username (kode 11000 dari MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan oleh orang lain" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password harus diisi",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada user dengan email tersebut",
      });
    }

    // Dapatkan token reset
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Buat URL reset
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Anda menerima email ini karena Anda (atau seseorang) meminta reset password untuk akun Anda.\n\nSilakan klik link berikut untuk membuat password baru:\n\n${resetUrl}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0;">Chronocanvas</h1>
          <p style="color: #6b7280; font-size: 16px; margin-top: 8px;">Permintaan Pengaturan Ulang Kata Sandi</p>
        </div>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Halo <strong>${user.username || "Pengguna"}</strong>,
          <br><br>
          Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Jika Anda memang membuat permintaan ini, silakan klik tombol di bawah ini untuk membuat kata sandi baru.
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
            Atur Ulang Kata Sandi
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
          Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:<br>
          <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;">
        
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0; line-height: 1.5;">
          Jika Anda tidak merasa meminta pengaturan ulang kata sandi, abaikan saja email ini. Keamanan akun Anda tetap terjaga.
          <br><br>
          &copy; ${new Date().getFullYear()} Chronocanvas.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Atur Ulang Kata Sandi - Chronocanvas",
        message,
        html,
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email tidak dapat dikirim",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Hash token dari URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token reset tidak valid atau sudah kedaluwarsa",
      });
    }

    // Set password baru
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah, silakan login",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
