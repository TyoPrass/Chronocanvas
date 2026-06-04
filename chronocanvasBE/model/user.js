const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username harus diisi"],
    unique: [true, "Username sudah digunakan"],
    trim: true,
    minlength: [3, "Username minimal 3 karakter"],
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"],
    unique: [true, "Email sudah digunakan"],
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Email tidak valid"],
  },
  password: {
    type: String,
    required: [true, "Password harus diisi"],
    minlength: [6, "Password minimal 6 karakter"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

userSchema.methods.comparePassword = async function (PasswordInput) {
  return await bcrypt.compare(PasswordInput, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Buat token raw
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token dan simpan ke field resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Atur masa berlaku token (misal: 10 menit)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
