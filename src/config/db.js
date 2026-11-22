import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI missing'); process.exit(1); }

export const client = new MongoClient(uri);
export let db;

export async function connectDB() {
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'mentorlagbe');
  console.log('MongoDB connected');
  await ensureIndexes();
}

async function ensureIndexes() {
  const users = db.collection('users');
  const tuitions = db.collection('tuitions');
  const applications = db.collection('applications');
  const payments = db.collection('payments');
  try { await users.createIndex({ email: 1 }, { unique: true }); } catch(e){}
  try { await tuitions.createIndex({ status: 1, subject: 1 }); } catch(e){}
  try { await tuitions.createIndex({ tutorId: 1 }); } catch(e){}
  try { await applications.createIndex({ tuitionId: 1, studentId: 1 }, { unique: true }); } catch(e){}
  try { await payments.createIndex({ transactionId: 1 }, { unique: true }); } catch(e){}
  try { await payments.createIndex({ userId: 1 }); } catch(e){}
}
