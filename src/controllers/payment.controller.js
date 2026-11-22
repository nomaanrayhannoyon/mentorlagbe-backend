import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { createCheckoutSession, stripe } from '../services/stripe.service.js';
import { uploadImage } from '../services/imgbb.service.js';

export async function createCheckout(req,res,next){
  try {
    if(!stripe) return res.status(503).json({error:'Stripe not configured'});
    const userId = req.user.id;
    const dup = await db.collection('payments').findOne({userId, status:'pending'});
    if(dup) return res.status(409).json({error:'Pending payment exists'});
    const session = await stripe.checkout.sessions.create({
      mode:'subscription',
      line_items:[{price:process.env.STRIPE_PRICE_PRO, quantity:1}],
      success_url: process.env.CLIENT_URL+'/profile?success=1',
      cancel_url: process.env.CLIENT_URL+'/profile?cancel=1',
      metadata:{userId},
    });
    await db.collection('payments').insertOne({userId, sessionId:session.id, status:'pending', createdAt:new Date()});
    res.json({url:session.url});
  } catch(e){next(e);}
}
export async function webhook(req,res,next){
  try {
    if(!stripe) return res.status(503).send('no stripe');
    const sig = req.headers['stripe-signature'];
    let event;
    try { event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET); }
    catch(err){ return res.status(400).send('bad sig'); }
    if(event.type==='checkout.session.completed'){
      const s = event.data.object;
      const userId = s.metadata.userId;
      await db.collection('payments').updateOne({sessionId:s.id},{$set:{status:'paid', transactionId:s.payment_intent, amount:s.amount_total}});
      await db.collection('users').updateOne({_id:new ObjectId(userId)},{$set:{plan:'pro'}});
    }
    res.json({received:true});
  } catch(e){next(e);}
}
export async function imgbbUpload(req,res,next){
  try {
    const { image } = req.body;
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { method:'POST', body:new URLSearchParams({image})});
    const data = await r.json();
    res.json(data);
  } catch(e){next(e);}
}
export async function revenueReport(req,res,next){
  try {
    const agg = await db.collection('payments').aggregate([{$match:{status:'paid'}},{$group:{_id:null,total:{$sum:'$amount'},count:{$sum:1}}}]).toArray();
    res.json(agg[0]||{total:0,count:0});
  } catch(e){next(e);}
}
export async function platformStats(req,res,next){
  try {
    const users = await db.collection('users').countDocuments();
    const tuitions = await db.collection('tuitions').countDocuments();
    const payments = await db.collection('payments').countDocuments({status:'paid'});
    res.json({users,tuitions,payments});
  } catch(e){next(e);}
}
