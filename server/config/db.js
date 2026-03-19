const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGO_URI || "").trim();

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in server/.env");
    }

    if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
      throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

