import { MongoClient } from 'mongodb';
import { generateEmbedding } from './embeddingService.js';
import computeCosineSimilarity from 'compute-cosine-similarity';

const MONGO_URI = "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/";

async function runTest() {
  console.log("Connecting database...");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('livestock_ai_db');
  const collection = db.collection('medicine_records');
  
  const query = "cow with high fever and coughing";
  console.log("Generating embedding for:", query);
  const qEmbed = await generateEmbedding(query);
  
  console.log("Query Embed Length:", qEmbed.length);
  
  const records = await collection.find({}).limit(5).toArray();
  console.log(`Loaded ${records.length} sample records...`);
  
  records.forEach((r, i) => {
    console.log(`Record ${i} Embed Length: ${r.embedding?.length}`);
    try {
      const score = computeCosineSimilarity(qEmbed, r.embedding);
      console.log(`Record ${i} -> Match Score: ${score}`);
    } catch(e) {
      console.log(`Failed similarity calculation for ${i}:`, e.message);
    }
  });

  await client.close();
  process.exit(0);
}

runTest().catch(console.error);
