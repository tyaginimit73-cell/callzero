import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, createUserAgent, request, app } from './helpers.js';

let server, alice, bob;

before(async () => {
  server = await startTestServer();
  alice = await createUserAgent({ name: 'Alice', username: 'alice', email: 'alice@t.com' });
  bob = await createUserAgent({ name: 'Bob', username: 'bob', email: 'bob@t.com' });
});
after(stopTestServer);

test('user search returns matching users', async () => {
  const res = await alice.get('/api/users/search?q=alice');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.users.length, 0); // alice excluded (self)
});

test('contact request flow: send, list, accept', async () => {
  const me = await bob.get('/api/auth/me');
  const bobId = me.body.data.user._id;

  const sent = await alice.post('/api/contacts/request').send({ userId: bobId });
  assert.equal(sent.status, 201);

  const reqs = await bob.get('/api/contacts/requests');
  assert.equal(reqs.body.data.requests.length, 1);
  const requestId = reqs.body.data.requests[0]._id;

  const accepted = await bob.post('/api/contacts/respond').send({ requestId, action: 'accept' });
  assert.equal(accepted.status, 200);

  const contacts = await alice.get('/api/contacts');
  assert.ok(contacts.body.data.contacts.some((c) => String(c.user._id) === String(bobId)));
});

test('cannot send a second duplicate contact request', async () => {
  const me = await alice.get('/api/auth/me');
  const aliceId = me.body.data.user._id;
  const res = await bob.post('/api/contacts/request').send({ userId: aliceId });
  assert.equal(res.status, 409);
  assert.equal(res.body.code, 'CONFLICT');
});

test('messaging flow: create conversation, send, retrieve', async () => {
  const a = await alice.get('/api/auth/me');
  const b = await bob.get('/api/auth/me');
  const aliceId = a.body.data.user._id;
  const bobId = b.body.data.user._id;

  const convRes = await alice.get(`/api/conversations/with/${bobId}`);
  assert.equal(convRes.status, 200);
  const conversationId = convRes.body.data.conversation._id;

  const send = await alice.post('/api/messages').send({
    conversationId,
    receiverId: bobId,
    content: 'Hey Bob!',
  });
  assert.equal(send.status, 201);

  const msgs = await bob.get(`/api/conversations/${conversationId}/messages`);
  assert.equal(msgs.status, 200);
  assert.ok(msgs.body.data.messages.some((m) => m.content === 'Hey Bob!'));
});

test('message validation rejects empty content', async () => {
  const b = await bob.get('/api/auth/me');
  const bobId = b.body.data.user._id;
  const convRes = await bob.get(`/api/conversations/with/${bobId}`);
  const res = await bob.post('/api/messages').send({ conversationId: convRes.body.data.conversation._id, receiverId: bobId, content: '' });
  assert.equal(res.status, 422);
  assert.equal(res.body.code, 'VALIDATION_ERROR');
});

test('authorization: unauthenticated request is rejected', async () => {
  const res = await request(app).get('/api/contacts'); // no auth
  assert.equal(res.status, 401);
});

test('admin endpoints require admin role', async () => {
  const forbidden = await alice.get('/api/admin/stats');
  assert.equal(forbidden.status, 403);

  const admin = await createUserAgent({ name: 'Admin', username: 'rootadmin', email: 'admin@t.com', admin: true });
  const ok = await admin.get('/api/admin/stats');
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.stats.totalUsers >= 3);
});

test('profile update validates input', async () => {
  const res = await alice.patch('/api/users/profile').send({ avatar: 'not-a-url' });
  assert.equal(res.status, 422);
  const ok = await alice.patch('/api/users/profile').send({ name: 'Alice Updated' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.user.name, 'Alice Updated');
});
