// Mimics exactly what server.js api/search route does
import { MongoClient } from 'mongodb';
import { generateEmbedding, initializeEmbedder } from './embeddingService.js';

const MONGO_URI = "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/";

function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  const len = vecA.length;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function main() {
  await initializeEmbedder();
  
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const collection = client.db('livestock_ai_db').collection('medicine_records');
  
  const query = "cow with high fever and coughing";
  
  // Step 1: Generate embedding
  console.log("Generating embedding...");
  const rawEmbedding = await generateEmbedding(query);
  console.log(`Raw embedding type: ${rawEmbedding.constructor?.name}, length: ${rawEmbedding.length}`);
  
  // Step 2: Array.from (as in route handler)
  const embedding = Array.from(rawEmbedding);
  console.log(`After Array.from, isArray: ${Array.isArray(embedding)}, length: ${embedding.length}`);
  
  // Step 3: Fetch records with projection (as in searchWithFallback)
  const records = await collection.find({}, {
    projection: { embedding: 1, text: 1, animal_type: 1, disease: 1, medicine_name: 1, original_data: 1 }
  }).limit(5).toArray();
  console.log(`Got ${records.length} records`);
  
  if (records.length > 0) {
    const r = records[0];
    console.log(`Record embedding isArray: ${Array.isArray(r.embedding)}, length: ${r.embedding?.length}`);
    const score = cosineSimilarity(embedding, r.embedding);
    console.log(`Test similarity score: ${score}`);
  }
  
  await client.close();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
