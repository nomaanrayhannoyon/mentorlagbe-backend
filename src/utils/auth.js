import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
export function verifyTokenRaw(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
export async function hashPassword(pw) { return bcrypt.hash(pw, 10); }
export async function comparePassword(pw, hash) { return bcrypt.compare(pw, hash); }
