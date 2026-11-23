import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';

export async function apply(req,res,next){
  try {
    const { tuitionId, studentPhone, preferredSchedule, studentNote } = req.body;
    const exists = await db.collection('applications').findOne({tuitionId, studentId:req.user.id});
    if(exists) return res.status(409).json({error:'Already applied'});
    const doc = { tuitionId, studentId:req.user.id, studentPhone, preferredSchedule, studentNote, status:'pending', createdAt:new Date(), updatedAt:new Date() };
    const r = await db.collection('applications').insertOne(doc);
    res.status(201).json({id:r.insertedId,...doc});
  } catch(e){next(e);}
}
export async function myApplications(req,res,next){
  try {
    const items = await db.collection('applications').find({studentId:req.user.id}).toArray();
    res.json(items);
  } catch(e){next(e);}
}
export async function bookmark(req,res,next){
  try {
    await db.collection('users').updateOne({_id:new ObjectId(req.user.id)},{$addToSet:{savedTuitions:req.body.tuitionId}});
    res.json({ok:true});
  } catch(e){next(e);}
}
export async function removeBookmark(req,res,next){
  try {
    await db.collection('users').updateOne({_id:new ObjectId(req.user.id)},{$pull:{savedTuitions:req.params.id}});
    res.json({ok:true});
  } catch(e){next(e);}
}
export async function bookmarks(req,res,next){
  try {
    const u = await db.collection('users').findOne({_id:new ObjectId(req.user.id)});
    res.json(u.savedTuitions||[]);
  } catch(e){next(e);}
}
