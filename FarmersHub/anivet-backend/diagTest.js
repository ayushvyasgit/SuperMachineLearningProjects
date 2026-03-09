import { MongoClient } from 'mongodb';
import { generateEmbedding, initializeEmbedder } from './embeddingService.js';
import computeCosineSimilarity from 'compute-cosine-similarity';

const MONGO_URI = "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/";

async function fullDiag() {
  await initializeEmbedder();

  console.log("\n--- Connecting DB ---");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('livestock_ai_db');
  const collection = db.collection('medicine_records');
  
  const count = await collection.countDocuments();
  console.log(`Records in DB: ${count}`);
  
  // Get sample record
  const sample = await collection.findOne({});
  console.log(`\nSample record embedding length: ${sample.embedding?.length}`);
  console.log(`Embedding type: ${typeof sample.embedding[0]}`);
  console.log(`First 3 values: ${sample.embedding?.slice(0,3)}`);

  // Generate query embedding
  const query = "cow with high fever and coughing";
  console.log(`\n--- Generating embedding for: "${query}" ---`);
  const qEmbed = await generateEmbedding(query);
  console.log(`Generated embedding length: ${qEmbed.length}`);
  console.log(`Generated embedding type: ${typeof qEmbed[0]}`);
  
  // Test similarity
  const qArr = Array.from(qEmbed);
  const dArr = Array.from(sample.embedding);
  console.log(`\n--- Similarity Test ---`);
  console.log(`qArr length: ${qArr.length}, dArr length: ${dArr.length}`);
  
  const score = computeCosineSimilarity(qArr, dArr);
  console.log(`Score: ${score}`);

  // Top 5 results
  const top5 = await collection.find({}, { projection: { embedding: 1, medicine_name: 1, animal_type: 1 } }).limit(100).toArray();
  const scored = top5.map(r => ({
    medicine: r.medicine_name,
    animal: r.animal_type,
    score: computeCosineSimilarity(qArr, Array.from(r.embedding))
  })).sort((a, b) => b.score - a.score).slice(0, 5);
  
  console.log("\nTop 5 matches:");
  scored.forEach(r => console.log(`  ${r.medicine} (${r.animal}) -> ${r.score.toFixed(4)}`));

  await client.close();
  process.exit(0);
}

fullDiag().catch(e => { console.error(e); process.exit(1); });
