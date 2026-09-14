import http from 'http';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';
import { initSocket } from '../sockets/index.js';

let mongo;
let server;
let io;

/** Start an isolated in-memory DB + HTTP/Socket server for tests. */
export async function startTestServer() {
  mongo = await MongoMemoryServer.create({
    instance: {
      storageEngine: 'wiredTiger',
      args: ['--wiredTigerCacheSizeGB', '0.25', '--setParameter', 'enableFlowControl=false'],
    },
  });
  await mongoose.connect(mongo.getUri());
  server = http.createServer(app);
  io = initSocket(server);
  await new Promise((resolve) => server.listen(0, resolve));
  return { base: `http://127.0.0.1:${server.address().port}`, io };
}

export async function stopTestServer() {
  io?.close();
  await new Promise((resolve) => server?.close(resolve));
  await mongoose.disconnect();
  await mongo?.stop();
}

/** Register + login a user, returning an authenticated supertest agent + user. */
export async function createUserAgent({ name, username, email, password = 'password123', admin = false }) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ name, username, email, password, confirmPassword: password });
  if (admin) {
    const User = mongoose.model('User');
    await User.updateOne({ email }, { role: 'admin' });
  }
  return agent;
}

export { request, app };
