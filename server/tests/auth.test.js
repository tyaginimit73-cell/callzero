import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, request, app } from './helpers.js';

before(startTestServer);
after(stopTestServer);

test('register creates an account and sets an auth cookie', async () => {
  const res = await request(app) // app exported via helpers? yes
    .post('/api/auth/register')
    .send({ name: 'Test User', username: 'testuser', email: 'test@x.com', password: 'password123', confirmPassword: 'password123' });
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.username, 'testuser');
  assert.ok(res.headers['set-cookie'].some((c) => c.startsWith('callzero_token')));
  // password must not be returned
  assert.equal(res.body.data.user.passwordHash, undefined);
});

test('register validates input and returns VALIDATION_ERROR', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'x', username: 'ba!d', email: 'bad', password: 'short', confirmPassword: 'nope' });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, 'VALIDATION_ERROR');
});

test('register rejects duplicate email', async () => {
  const payload = { name: 'Dup', username: 'dup1', email: 'dup@x.com', password: 'password123', confirmPassword: 'password123' };
  await request(app).post('/api/auth/register').send(payload);
  const res = await request(app).post('/api/auth/register').send({ ...payload, username: 'dup2' });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, 'CONFLICT');
});

test('login with correct credentials returns token', async () => {
  const res = await request(app).post('/api/auth/login').send({ identifier: 'testuser', password: 'password123' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.username, 'testuser');
});

test('login with wrong password is rejected', async () => {
  const res = await request(app).post('/api/auth/login').send({ identifier: 'testuser', password: 'wrongpass' });
  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'UNAUTHORIZED');
});

test('GET /api/auth/me requires auth', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('logout clears the session', async () => {
  const login = await request(app).post('/api/auth/login').send({ identifier: 'testuser', password: 'password123' });
  const cookie = login.headers['set-cookie'][0].split(';')[0];
  const out = await request(app).post('/api/auth/logout').set('Cookie', cookie);
  assert.equal(out.status, 200);
});
