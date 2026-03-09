import { MongoClient } from 'mongodb';

const MONGO_URI = "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/";

async function checkEmbType() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const collection = client.db('livestock_ai_db').collection('medicine_records');
  
  const r = await collection.findOne({});
  console.log('isArray:', Array.isArray(r.embedding));
  console.log('embedding length:', r.embedding?.length);
  console.log('type of first el:', typeof r.embedding?.[0]);
  
  await client.close();
}

checkEmbType().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
