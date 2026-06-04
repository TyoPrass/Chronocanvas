const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Jangan pakai process.exit(1) karena akan membunuh Vercel Serverless
  }
};

module.exports = connectDB;