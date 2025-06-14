import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "iconnect",
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Ensure connection is ready before returning
    if (cached.conn.readyState !== 1) {
      cached.promise = null;
      cached.conn = null;
      throw new Error("Database connection failed to establish");
    }
    
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};