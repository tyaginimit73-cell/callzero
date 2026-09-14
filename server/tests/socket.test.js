import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { io as Client } from 'socket.io-client';
import { startTestServer, stopTestServer, request } from './helpers.js';

let base, sockets = [], server;

before(async () => {
  server = await startTestServer();
  base = server.base;
});
after(async () => {
  sockets.forEach((s) => s?.close());
  await stopTestServer();
});

async function makeSocket(username) {
  const res = await request(base)
    .post('/api/auth/register')
    .send({ name: username, username, email: `${username}@s.io`, password: 'password123', confirmPassword: 'password123' });
  const token = res.body.data.token;
  const socket = Client(base, { auth: { token }, transports: ['websocket'], reconnection: false, forceNew: true });
  sockets.push(socket);
  await new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
  });
  return socket;
}

async function resolveId(identifier) {
  const me = await request(base).post('/api/auth/login').send({ identifier, password: 'password123' });
  return me.body.data.user._id;
}

test('socket.io authenticates via token', async () => {
  const s = await makeSocket('carol');
  assert.ok(s.connected);
});

test('WebRTC call signaling: offer → incoming → answer → ice-candidate', async () => {
  const alice = await makeSocket('dave');
  const bob = await makeSocket('erin');
  const bobId = await resolveId('erin');

  const incoming = new Promise((resolve) => bob.once('call:incoming', resolve));

  const offerAck = await new Promise((resolve) => {
    alice.emit('call:offer', { receiverId: bobId, type: 'voice', sdp: { type: 'offer', sdp: 'SDP_A' }, callId: null }, resolve);
  });
  assert.equal(offerAck.success, true);

  const inc = await incoming;
  assert.equal(inc.from.username, 'dave');
  assert.equal(inc.type, 'voice');

  const answer = new Promise((resolve) => alice.once('call:answer', resolve));
  bob.emit('call:answer', { callId: inc.callId, sdp: { type: 'answer', sdp: 'SDP_B' }, receiverId: bobId });
  const ans = await answer;
  assert.equal(ans.sdp.sdp, 'SDP_B');

  const ice = new Promise((resolve) => bob.once('call:ice-candidate', resolve));
  alice.emit('call:ice-candidate', { callId: inc.callId, candidate: { candidate: 'candidate:1' }, to: bobId });
  const cand = await ice;
  assert.equal(cand.candidate.candidate, 'candidate:1');

  const endA = new Promise((resolve) => alice.once('call:end', resolve));
  bob.emit('call:end', { callId: inc.callId, duration: 5 });
  await endA;
});

test('call offer to an offline user reports OFFLINE', async () => {
  const frank = await makeSocket('frank');
  const g = await request(base).post('/api/auth/register').send({ name: 'Gina', username: 'gina', email: 'gina@s.io', password: 'password123', confirmPassword: 'password123' });
  const ginaId = g.body.data.user._id; // registered but no socket connected

  const ack = await new Promise((resolve) =>
    frank.emit('call:offer', { receiverId: ginaId, type: 'voice', sdp: { type: 'offer', sdp: 'x' }, callId: null }, resolve)
  );
  assert.equal(ack.success, false);
  assert.equal(ack.code, 'OFFLINE');
});
