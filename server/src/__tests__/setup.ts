/**
 * Global test setup and teardown.
 *
 * Spins up a MongoMemoryServer before all tests,
 * connects Mongoose to it, and tears everything down afterwards.
 * Each test file gets a clean database (collections are dropped between suites).
 */
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongo: MongoMemoryReplSet;

// Set required env vars BEFORE importing app (env.ts validates on import)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-at-least-16-chars';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGODB_URI = 'will-be-overridden';

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongo.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Drop all collections between test suites for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
