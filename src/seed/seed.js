import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { hashPassword } from '../utils/auth.js';

await connectDB();
const { db } = await import('../config/db.js');

const usersCol = db.collection('users');
const tuitionsCol = db.collection('tuitions');

// Seed sample tutor and student users (no admin - admin is created via better-auth)
const tutor = { name:'Tutor One', email:'tutor@mentorlagbe.com', password: await hashPassword('tutor123'), role:'tutor', plan:'pro', createdAt:new Date() };
const student = { name:'Student One', email:'student@mentorlagbe.com', password: await hashPassword('student123'), role:'student', plan:'free', createdAt:new Date() };

for(const u of [tutor, student]) await usersCol.updateOne({email:u.email},{$set:u},{upsert:true});

const t = await usersCol.findOne({email:'tutor@mentorlagbe.com'});
const subjects = ['Math','Physics','Chemistry','English','Biology'];
for(let i=0;i<12;i++){
  await tuitionsCol.insertOne({ 
    tutorId:t._id.toString(), 
    subject:subjects[i%5], 
    classLevel:['Class 9','Class 10','SSC','HSC','University'][i%5],
    mode:'Offline', 
    location:'Dhaka', 
    monthlyFee:500+i*50, 
    description:`Tuition ${i}`, 
    approvalStatus:'approved', 
    isActive:true, 
    createdAt:new Date(), 
    updatedAt:new Date() 
  });
}
console.log('Seed done');
process.exit(0);
