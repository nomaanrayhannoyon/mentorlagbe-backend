import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { signToken, hashPassword, comparePassword } from '../utils/auth.js';

export async function syncUser(req,res,next){
  try {
    const { name, email, role } = req.body;
    let user = await db.collection('users').findOne({email});
    if(!user){
      const r = await db.collection('users').insertOne({ name, email, password:'', role: role||'student', plan:'free', createdAt:new Date(), syncedFrom:'better-auth' });
      user = { _id:r.insertedId, name, email, role: role||'student', plan:'free' };
    } else {
      await db.collection('users').updateOne({email},{$set:{name, role: role||user.role}});
    }
    const token = signToken({ id: user._id.toString(), email, role: user.role||role||'student' });
    res.json({ token, user });
  } catch(e){next(e);}
}

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
