import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import EmergencyContact from '../models/EmergencyContact.js';
import { connectDB, disconnectDB } from '../config/db.js';

/**
 * Seeds a demo dataset:
 *  - admin account
 *  - two demo users (alice, bob) who are contacts
 *  - an emergency contact for alice
 *
 * Run:  npm run seed -w server
 */
async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash('password123', 12);

  const [admin, alice, bob] = await Promise.all([
    User.findOneAndUpdate(
      { email: 'admin@callzero.app' },
      { name: 'System Admin', username: 'admin', email: 'admin@callzero.app', passwordHash, role: 'admin' },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'alice@callzero.app' },
      { name: 'Alice Johnson', username: 'alice', email: 'alice@callzero.app', passwordHash, status: 'online' },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { email: 'bob@callzero.app' },
      { name: 'Bob Williams', username: 'bob', email: 'bob@callzero.app', passwordHash, status: 'online' },
      { upsert: true, new: true }
    ),
  ]);

  // make them contacts
  await User.updateOne(
    { _id: alice._id },
    { $addToSet: { contacts: { user: bob._id, addedAt: new Date() } } }
  );
  await User.updateOne(
    { _id: bob._id },
    { $addToSet: { contacts: { user: alice._id, addedAt: new Date() } } }
  );

  await EmergencyContact.deleteMany({ user: alice._id });
  await EmergencyContact.create({
    user: alice._id,
    name: 'Mom',
    relationship: 'Mother',
    contactUser: bob._id,
    phone: '+1 555 0100',
    priority: 1,
  });

  console.log('Seeded:');
  console.log('  admin@callzero.app / password123  (admin)');
  console.log('  alice@callzero.app / password123');
  console.log('  bob@callzero.app   / password123');

  await disconnectDB();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
