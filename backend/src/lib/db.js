import dns from "dns";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

// Router DNS often fails SRV lookups for mongodb+srv:// Atlas URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  while (true) {
    try {
      console.log("Connecting to MongoDB...");
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.log("MongoDB connection error:", error.message);
      console.log("Retrying DB connection in 5s...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export const waitForDb = (maxWaitMs = 12000) =>
  new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      mongoose.connection.removeListener("connected", onConnected);
      reject(new Error("Database unavailable"));
    }, maxWaitMs);

    const onConnected = () => {
      clearTimeout(timer);
      resolve();
    };

    mongoose.connection.once("connected", onConnected);
  });
