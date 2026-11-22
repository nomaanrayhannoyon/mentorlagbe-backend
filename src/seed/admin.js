import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { hashPassword } from '../utils/auth.js';

await connectDB();
const { db } = await import('../config/db.js');
const users = db.collection('users');
const email = 'admin@mentorlagbe.com';
const exists = await users.findOne({ email });
if (exists) {
  await users.updateOne({ email }, { $set: { role: 'admin', plan: 'pro' } });
  console.log('Admin already exists; role/plan ensured.');
} else {
  await users.insertOne({
    name: 'Admin',
    email,
    password: await hashPassword('MentorAdmin@2026!'),
    role: 'admin',
    plan: 'pro',
    createdAt: new Date(),
  });
  console.log('Admin created.');
}
process.exit(0);
