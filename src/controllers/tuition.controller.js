import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { uploadImage } from '../services/imgbb.service.js';
import { validate, tuitionSchema } from '../utils/validation.js';

// List tuitions (public, approved only)
export const listTuitions = async (req,res,next)=>{
  try {
    const { subject, location, minBudget, maxBudget, page=1, limit=10, search } = req.query;
    const q = { approvalStatus:'approved' };
    if(subject) q.subject = subject;
    if(location) q.location = location;
    if(minBudget||maxBudget){ q.monthlyFee = {}; if(minBudget) q.monthlyFee.$gte=Number(minBudget); if(maxBudget) q.monthlyFee.$lte=Number(maxBudget); }
    if(search) q.$or = [{subject:new RegExp(search,'i')},{description:new RegExp(search,'i')}];
    const skip = (Number(page)-1)*Number(limit);
    const items = await db.collection('tuitions').find(q).skip(skip).limit(Number(limit)).toArray();
    const total = await db.collection('tuitions').countDocuments(q);
    res.json({ items, total, page:Number(page), limit:Number(limit) });
  } catch(e){next(e);}
};

// Create tuition (tutor only)
export const createTuition = async (req,res,next)=>{
  try {
    const tutorId = req.user.id;
    const user = await db.collection('users').findOne({_id:new ObjectId(tutorId)});
    const count = await db.collection('tuitions').countDocuments({tutorId});
    if(user.plan==='free' && count>=2) return res.status(403).json({error:'Free plan limit reached'});
    let imageUrl;
    if(req.body.imageBase64){
      imageUrl = await uploadImage(req.body.imageBase64);
    }
    const doc = { ...req.body, tutorId, approvalStatus:'pending', isActive:true, createdAt:new Date(), updatedAt:new Date() };
    if(imageUrl) doc.bannerImage = imageUrl;
    const r = await db.collection('tuitions').insertOne(doc);
    res.status(201).json({id:r.insertedId, ...doc});
  } catch(e){next(e);}
};

export const getTuition = async (req,res,next)=>{
  try {
    const t = await db.collection('tuitions').findOne({_id:new ObjectId(req.params.id)});
    if(!t) return res.status(404).json({error:'Not found'});
    res.json(t);
  } catch(e){next(e);}
};

export const updateTuition = async (req,res,next)=>{
  try {
    await db.collection('tuitions').updateOne({_id:new ObjectId(req.params.id), tutorId:req.user.id},{$set:{...req.body, updatedAt:new Date()}});
    res.json({ok:true});
  } catch(e){next(e);}
};

export const deleteTuition = async (req,res,next)=>{
  try {
    await db.collection('tuitions').deleteOne({_id:new ObjectId(req.params.id), tutorId:req.user.id});
    res.json({ok:true});
  } catch(e){next(e);}
};

export const myTuitions = async (req,res,next)=>{
  try {
    const items = await db.collection('tuitions').find({tutorId:req.user.id}).toArray();
    res.json(items);
  } catch(e){next(e);}
};

export const applicants = async (req,res,next)=>{
  try {
    const items = await db.collection('applications').find({tuitionId:req.params.id}).toArray();
    res.json(items);
  } catch(e){next(e);}
};

export const updateApplicationStatus = async (req,res,next)=>{
  try {
    await db.collection('applications').updateOne({_id:new ObjectId(req.params.appId)},{$set:{status:req.body.status}});
    res.json({ok:true});
  } catch(e){next(e);}
};
