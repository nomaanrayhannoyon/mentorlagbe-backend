import { betterAuth } from 'better-auth';
import { db } from '../config/db.js';
import { signToken } from '../utils/auth.js';
import { ObjectId } from 'mongodb';

// Initialize BetterAuth with email/password provider and optional social providers.
export const auth = betterAuth({
  // Example minimal config; you can extend with social providers.
  emailAndPassword: { enabled: true },
  // You can add other providers here (google, github, etc.)
});

/**
 * Register a new user via BetterAuth.
 * Returns { user, token } where token is our JWT for API usage.
 */
export async function registerUser({ name, email, password, role = 'student' }) {
  const { user } = await auth.register({ name, email, password });
  // Store additional fields in our own users collection.
  const newUser = {
    _id: new ObjectId(user.id),
    name: user.name,
    email: user.email,
    role,
    plan: 'free',
    createdAt: new Date(),
  };
  await db.collection('users').insertOne(newUser);
  const token = signToken({ id: newUser._id.toString(), email, role });
  return { user: newUser, token };
}

/**
 * Login a user via BetterAuth.
 */
export async function loginUser({ email, password }) {
  const { user } = await auth.login({ email, password });
  const dbUser = await db.collection('users').findOne({ email });
  if (!dbUser) {
    // If user not found in our collection, create a minimal record.
    const newUser = {
      _id: new ObjectId(user.id),
      name: user.name,
      email: user.email,
      role: 'student',
      plan: 'free',
      createdAt: new Date(),
    };
    await db.collection('users').insertOne(newUser);
    const token = signToken({ id: newUser._id.toString(), email, role: newUser.role });
    return { user: newUser, token };
  }
  const token = signToken({ id: dbUser._id.toString(), email, role: dbUser.role });
  return { user: dbUser, token };
}

/**
 * Sync a BetterAuth user into our collection (used for social logins).
 */
export async function syncBetterAuthUser({ name, email, role = 'student' }) {
  let user = await db.collection('users').findOne({ email });
  if (!user) {
    const r = await db.collection('users').insertOne({ name, email, role, plan: 'free', createdAt: new Date() });
    user = { _id: r.insertedId, name, email, role, plan: 'free' };
  } else {
    await db.collection('users').updateOne({ email }, { $set: { name, role: role || user.role } });
  }
  const token = signToken({ id: user._id.toString(), email, role: user.role });
  return { user, token };
}
