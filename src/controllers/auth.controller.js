import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { registerUser, loginUser, syncBetterAuthUser } from '../services/betterAuth.service.js';
import { validate, registerSchema, loginSchema, syncSchema } from '../utils/validation.js';

export const syncUser = [
  validate(syncSchema),
  async (req, res, next) => {
    try {
      const { user, token } = await syncBetterAuthUser(req.body);
      res.json({ token, user });
    } catch (e) {
      next(e);
    }
  }
];

export async function register(req,res,next){
  try {
    const { name, email, password, role } = req.body;
    if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
    const exists = await db.collection('users').findOne({email});
    if(exists) return res.status(409).json({error:'Email exists'});
    const user = { name, email, password: await hashPassword(password), role: role||'student', plan:'free', createdAt:new Date() };
    const r = await db.collection('users').insertOne(user);
    const token = signToken({ id: r.insertedId.toString(), email, role: user.role });
    res.json({ token, user: {id:r.insertedId, name, email, role:user.role, plan:user.plan} });
  } catch(e){next(e);}
}
export async function login(req,res,next){
  try {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({email});
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await comparePassword(password, user.password);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = signToken({ id: user._id.toString(), email, role: user.role });
    res.json({ token, user: {id:user._id, name:user.name, email, role:user.role, plan:user.plan} });
  } catch(e){next(e);}
}
export async function me(req,res,next){
  try {
    const u = await db.collection('users').findOne({_id:new ObjectId(req.user.id)});
    res.json(u);
  } catch(e){next(e);}
}
