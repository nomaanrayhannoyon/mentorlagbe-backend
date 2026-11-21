import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(express.json());
app.use(cors());


const { DB_USER, DB_PASSWORD } = process.env;

if (!DB_USER || !DB_PASSWORD) {
  console.error("Missing DB_USER or DB_PASSWORD in .env file");
  process.exit(1);
}

const client = new MongoClient(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.kgm5q2i.mongodb.net/`
);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("Failed to connect to MongoDB:");
    console.dir(err);
    process.exit(1);
  }
}
const clientConnection = await connectToMongoDB();
const database = clientConnection.db("mentorlagbe");
const users = database.collection("user");
//http://localhost:5000
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get ('/users', async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})