import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import EmergencyContact from '../models/EmergencyContact.js';
import env from '../config/env.js';

/**
 * Creates demo accounts the first time the app starts (skipped in production or
 * when users already exist). Makes the demo immediately usable.
 */
export async function ensureDemoData() {
  if (env.NODE_ENV === 'production') return;
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await User.create({ name: 'System Admin', username: 'admin', email: 'admin@callzero.app', passwordHash, role: 'admin', status: 'online' });
  const alice = await User.create({ name: 'Alice Johnson', username: 'alice', email: 'alice@callzero.app', passwordHash, status: 'online' });
  const bob = await User.create({ name: 'Bob Williams', username: 'bob', email: 'bob@callzero.app', passwordHash, status: 'online' });

  await User.updateOne({ _id: alice._id }, { $addToSet: { contacts: { user: bob._id, addedAt: new Date() } } });
  await User.updateOne({ _id: bob._id }, { $addToSet: { contacts: { user: alice._id, addedAt: new Date() } } });

  await EmergencyContact.create({
    user: alice._id,
    name: 'Mom',
    relationship: 'Mother',
    contactUser: bob._id,
    phone: '+1 555 0100',
    priority: 1,
  });

  console.log('[seed] Created demo accounts (admin / alice / bob) — password: password123');
}
