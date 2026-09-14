import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import env from './env.js';

/** Returns a cached mongod binary path if one exists (avoids network fetch). */
function locateCachedBinary() {
  if (process.env.MONGOMS_SYSTEM_BINARY) return process.env.MONGOMS_SYSTEM_BINARY;
  const dirs = [
    path.resolve('node_modules/.cache/mongodb-memory-server'),
    path.resolve('../node_modules/.cache/mongodb-memory-server'),
  ];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const file = fs.readdirSync(dir).find((f) => f.startsWith('mongod-'));
      if (file) return path.join(dir, file);
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Connects to MongoDB. In production/dev it uses MONGODB_URI (e.g. MongoDB Atlas).
 * When no URI is provided (sandbox/demo mode) it lazily boots an in-memory
 * MongoDB instance via mongodb-memory-server so the app still runs.
 */
export async function connectDB() {
  if (env.MONGODB_URI) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    console.log(`[db] Connected to MongoDB (${env.NODE_ENV})`);
    return mongoose.connection;
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');

  // If a cached mongod binary exists, use it directly (no network check).
  const binary = await locateCachedBinary();
  const mongo = await (binary
    ? MongoMemoryServer.create({ binary })
    : MongoMemoryServer.create());
  const uri = mongo.getUri();
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[db] Connected to in-memory MongoDB (demo mode - set MONGODB_URI for persistence)');
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
