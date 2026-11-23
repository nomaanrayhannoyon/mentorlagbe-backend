import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';

export async function users(req,res,next){ try { res.json(await db.collection('users').find({}).toArray()); } catch(e){next(e);} }
export async function updateRole(req,res,next){ try { await db.collection('users').updateOne({_id:new ObjectId(req.params.id)},{$set:{role:req.body.role}}); res.json({ok:true}); } catch(e){next(e);} }
export async function approveTuition(req,res,next){ try { await db.collection('tuitions').updateOne({_id:new ObjectId(req.params.id)},{$set:{approvalStatus:'approved'}}); res.json({ok:true}); } catch(e){next(e);} }
export async function rejectTuition(req,res,next){ try { await db.collection('tuitions').updateOne({_id:new ObjectId(req.params.id)},{$set:{approvalStatus:'rejected'}}); res.json({ok:true}); } catch(e){next(e);} }
export async function pendingTuitions(req,res,next){ try { res.json(await db.collection('tuitions').find({approvalStatus:'pending'}).toArray()); } catch(e){next(e);} }
