import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  // If we have a cached connection and it's ready, return it
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // If there's no cached promise, create a new connection
  if (!cached.promise) {
    const opts = {
      dbName: "iconnect",
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    
    // Additional check to ensure connection is truly ready
    if (cached.conn.readyState !== 1) {
      // Reset cache if connection failed
      cached.promise = null;
      cached.conn = null;
      throw new Error("Database connection failed to establish - connection not ready");
    }
    
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    // Reset cache on error
    cached.promise = null;
    cached.conn = null;
    
    console.error("❌ MongoDB connection error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error("Database connection failed: Unable to resolve MongoDB hostname. Please check your connection string.");
      } else if (error.message.includes('authentication failed')) {
        throw new Error("Database connection failed: Authentication failed. Please check your username and password.");
      } else if (error.message.includes('timeout')) {
        throw new Error("Database connection failed: Connection timeout. Please check your network connection and MongoDB server status.");
      } else {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
    
    throw new Error("Database connection failed: Unknown error occurred");
  }
};

// Add a function to gracefully close the connection
export const disconnectFromDatabase = async () => {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 MongoDB disconnected");
  }
};

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
}