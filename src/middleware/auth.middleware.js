import { verifyTokenRaw } from '../utils/auth.js';
import { db } from '../config/db.js';

export async function verifyToken(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = verifyTokenRaw(h.slice(7));
    const user = await db.collection('users').findOne({ _id: decoded.id ? new (await import('mongodb')).ObjectId(decoded.id) : null });
    req.user = decoded;
    req.dbUser = user;
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid token' }); }
}

export const verifyStudent = [verifyToken, (req,res,next)=> req.user.role==='student'?next():res.status(403).json({error:'Student only'})];
export const verifyTutor = [verifyToken, (req,res,next)=> req.user.role==='tutor'?next():res.status(403).json({error:'Tutor only'})];
export const verifyAdmin = [verifyToken, (req,res,next)=> req.user.role==='admin'?next():res.status(403).json({error:'Admin only'})];
