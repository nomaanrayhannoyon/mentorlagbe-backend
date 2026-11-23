import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { hashPassword } from '../utils/auth.js';

await connectDB();
const { db } = await import('../config/db.js');
const users = db.collection('users');

// Note: The primary admin account (admin1@example.com) is managed by better-auth
// on the client side. This script ensures no conflicting admin is created here.
// If an admin@mentorlagbe.com record exists from legacy seeding, it is left
// untouched to avoid data loss — remove it manually from MongoDB Atlas if needed.
console.log('Admin seed: no separate admin created. Primary admin is admin1@example.com via better-auth.');
process.exit(0);
