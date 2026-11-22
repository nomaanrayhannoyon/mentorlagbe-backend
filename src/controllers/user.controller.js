import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';

export async function profile(req,res,next){
  try { const u = await db.collection('users').findOne({_id:new ObjectId(req.user.id)}); res.json(u); } catch(e){next(e);}
}
export async function updateProfile(req,res,next){
  try { await db.collection('users').updateOne({_id:new ObjectId(req.user.id)},{$set:req.body}); res.json({ok:true}); } catch(e){next(e);}
}
