import mongoose from "mongoose";
import { config } from "dotenv";

config();

export const connectDB = async (retries = 3) => {
  try {
    console.log("Using MongoDB URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    if (retries > 0) {
      console.log(`Retrying DB connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retries - 1);
    }
    throw error;
  }
};
