import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';

export async function listTuitions(req,res,next){
  try {
    const { subject, location, minBudget, maxBudget, page=1, limit=10, search } = req.query;
    const q = { status:'approved' };
    if(subject) q.subject = subject;
    if(location) q.location = location;
    if(minBudget||maxBudget){ q.budget = {}; if(minBudget) q.budget.$gte=Number(minBudget); if(maxBudget) q.budget.$lte=Number(maxBudget);}
    if(search) q.$or = [{subject:new RegExp(search,'i')},{description:new RegExp(search,'i')}];
    const skip=(Number(page)-1)*Number(limit);
    const items = await db.collection('tuitions').find(q).skip(skip).limit(Number(limit)).toArray();
    const total = await db.collection('tuitions').countDocuments(q);
    res.json({ items, total, page:Number(page), limit:Number(limit) });
  } catch(e){next(e);}
}
export async function createTuition(req,res,next){
  try {
    const tutorId = req.user.id;
    const user = await db.collection('users').findOne({_id:new ObjectId(tutorId)});
    const count = await db.collection('tuitions').countDocuments({tutorId});
    if(user.plan==='free' && count>=5) return res.status(403).json({error:'Free plan limit reached'});
    const doc = { ...req.body, tutorId, status:'pending', createdAt:new Date() };
    const r = await db.collection('tuitions').insertOne(doc);
    res.status(201).json({id:r.insertedId,...doc});
  } catch(e){next(e);}
}
export async function getTuition(req,res,next){
  try {
    const t = await db.collection('tuitions').findOne({_id:new ObjectId(req.params.id)});
    if(!t) return res.status(404).json({error:'Not found'});
    res.json(t);
  } catch(e){next(e);}
}
export async function updateTuition(req,res,next){
  try {
    await db.collection('tuitions').updateOne({_id:new ObjectId(req.params.id), tutorId:req.user.id},{$set:req.body});
    res.json({ok:true});
  } catch(e){next(e);}
}
export async function deleteTuition(req,res,next){
  try {
    await db.collection('tuitions').deleteOne({_id:new ObjectId(req.params.id), tutorId:req.user.id});
    res.json({ok:true});
  } catch(e){next(e);}
}
export async function myTuitions(req,res,next){
  try {
    const items = await db.collection('tuitions').find({tutorId:req.user.id}).toArray();
    res.json(items);
  } catch(e){next(e);}
}
export async function applicants(req,res,next){
  try {
    const items = await db.collection('applications').find({tuitionId:req.params.id}).toArray();
    res.json(items);
  } catch(e){next(e);}
}
export async function updateApplicationStatus(req,res,next){
  try {
    await db.collection('applications').updateOne({_id:new ObjectId(req.params.appId)},{$set:{status:req.body.status}});
    res.json({ok:true});
  } catch(e){next(e);}
}
