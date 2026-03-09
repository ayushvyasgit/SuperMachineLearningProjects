import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding, initializeEmbedder } from './embeddingService.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const CONFIG = {
  MONGO_URI:
  process.env.MONGO_URI || "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/livestock_ai_db",
  DATABASE_NAME: "livestock_ai_db",
  COLLECTION_NAME: "medicine_records",
  VECTOR_INDEX_NAME: "vector_index",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyDztMef5uYQhIkPZN21zMHk1X9sslhC9ok",
  PORT: process.env.PORT || 5000,
};

if (!CONFIG.GEMINI_API_KEY) {
  console.warn("⚠️  WARNING: GEMINI_API_KEY not set in environment variables");
}

let db, collection;
const genAI = CONFIG.GEMINI_API_KEY
  ? new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY)
  : null;

// Connect to MongoDB Atlas
async function connectToMongoDB() {
  const MONGO_URI = "mongodb+srv://ayushvyas99199:qegXvJWDh8bkgI1Q@a1.mihxsrj.mongodb.net/livestock_ai_db";
  const DATABASE_NAME = "livestock_ai_db";
  const COLLECTION_NAME = "medicine_records";
  try {
    console.log("🔌 Connecting to MongoDB...");
    const client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 120000,
    });
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    const count = await collection.countDocuments();
    console.log(`✅ MongoDB connected! Database: ${DATABASE_NAME}`);
    console.log(`📊 Found ${count} records in collection`);
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Calculate cosine similarity between two vectors (inline, reliable)
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

// Search using MongoDB Atlas Vector Search
async function searchWithVectorIndex(queryEmbedding, options) {
  const { topK = 5, animalFilter = null, minSimilarity = 0.2 } = options;
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: CONFIG.VECTOR_INDEX_NAME,
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 200,
          limit: topK * 3,
        },
      },
      {
        $project: {
          text: 1,
          animal_type: 1,
          disease: 1,
          medicine_name: 1,
          original_data: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    if (animalFilter) {
      pipeline.splice(1, 0, {
        $match: { animal_type: animalFilter.toLowerCase() },
      });
    }

    const results = await collection.aggregate(pipeline).toArray();
    console.log(`Raw aggregation query returned ${results.length} documents.`);
    if (results.length > 0) {
      console.log(`Top result score from MongoDB: ${results[0].score}`);
    }
    const filtered = results
      .filter((r) => r.score >= minSimilarity)
      .slice(0, topK);

    console.log(`✅ Vector Search found ${filtered.length} results`);
    return filtered;
  } catch (error) {
    console.error("❌ Vector Search error:", error);
    throw error;
  }
}

// Fallback search using client-side cosine similarity
async function searchWithFallback(queryEmbedding, options) {
  const { topK = 5, animalFilter = null, minSimilarity = 0.1 } = options;
  try {
    console.log("⚠️  Using fallback similarity search...");
    if (!collection) {
      console.error("❌ ERROR: collection is null/undefined - MongoDB not initialized!");
      return [];
    }
    const filter = animalFilter ? { animal_type: animalFilter.toLowerCase() } : {};
    const records = await collection.find(filter, {
      projection: { embedding: 1, text: 1, animal_type: 1, disease: 1, medicine_name: 1, original_data: 1 }
    }).toArray();
    console.log(`📊 Processing ${records.length} records...`);

    if (records.length === 0) return [];

    const qVec = queryEmbedding; // already a plain array from route handler
    console.log(`Query dim: ${qVec.length}, First record dim: ${records[0].embedding?.length}`);

    // Score all records — avoid Math.max(...bigArray) stack overflow with reduce
    let maxScore = 0;
    const resultsWithScores = records
      .filter(r => r.embedding && r.embedding.length === qVec.length)
      .map((record) => {
        const score = cosineSimilarity(qVec, record.embedding);
        if (score > maxScore) maxScore = score;
        return { ...record, score };
      });

    console.log(`Max similarity: ${maxScore.toFixed(4)}, Total: ${resultsWithScores.length}`);

    const filtered = resultsWithScores
      .filter((r) => r.score >= minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    console.log(`✅ Found ${filtered.length} results above threshold ${minSimilarity}`);
    return filtered;
  } catch (error) {
    console.error("❌ Fallback search error:", error);
    throw error;
  }
}



// Smart search: tries Atlas Vector Search first, falls back to cosine similarity if needed
async function searchMedicines(queryEmbedding, options) {
  try {
    return await searchWithVectorIndex(queryEmbedding, options);
  } catch (error) {
    console.log("⚠️  Vector Search failed, using fallback...", error.message);
    return await searchWithFallback(queryEmbedding, options);
  }
}

// Create prompt for Gemini AI
function createGeminiPrompt(query, searchResults) {
  const PARENT_PROMPT = `You are FarmConnect AI Assistant - a specialized veterinary medicine advisor for farmers and pet owners.

CRITICAL CONTEXT BOUNDARIES:
- You ONLY provide advice about livestock and pet health, medicines, and veterinary care
- You work exclusively within the FarmConnect platform context
- You MUST refuse any requests outside of animal health and medicine topics
- Do NOT answer questions about: human medicine, general knowledge, coding, math problems, creative writing, or any non-veterinary topics
- If asked about topics outside animal health, respond: "I'm FarmConnect AI Assistant, specialized in livestock and pet medicine. I can only help with animal health questions. Please ask about symptoms, diseases, or medicines for animals."

YOUR ROLE:
- Provide practical, farmer-friendly veterinary medicine recommendations
- Use the medicine database to suggest appropriate treatments
- Give clear dosage and administration instructions
- Emphasize safety and when to consult a veterinarian
- Stay within the scope of animal health and welfare

Now process this veterinary query:`;

  if (!searchResults || searchResults.length === 0) {
    return `${PARENT_PROMPT}

The farmer asked: "${query}"

Unfortunately, I couldn't find specific medicine recommendations in the FarmConnect database for this query.

STAY IN CONTEXT: Only provide animal health advice. If this query is not about animal health, politely redirect.

Please provide:
1. **Assessment**: Is this about animal health? If yes, what condition might it be?
2. **General Care**: Basic veterinary advice for this situation
3. **Veterinarian Consultation**: When to seek professional help
4. **Immediate Actions**: What the farmer should do now

Keep the response practical, clear, and farmer-friendly. If the query is outside animal health scope, refuse politely.`;
  }

  let context = "Here is relevant veterinary medicine information from FarmConnect database:\n\n";
  searchResults.forEach((result, i) => {
    const data = result.original_data || {};
    context += `**Medicine Option ${i + 1}:**\n`;
    context += `- Medicine Name: ${result.medicine_name || "N/A"}\n`;
    context += `- Animal Type: ${result.animal_type || "N/A"}\n`;
    context += `- Disease: ${result.disease || "N/A"}\n`;
    if (data.Medicine_Category) context += `- Category: ${data.Medicine_Category}\n`;
    if (data.Dosage_Form) context += `- Form: ${data.Dosage_Form}\n`;
    if (data.Strength_mg) context += `- Strength: ${data.Strength_mg} mg\n`;
    if (data.Classification) context += `- Classification: ${data.Classification}\n`;
    if (data.Manufacturer) context += `- Manufacturer: ${data.Manufacturer}\n`;
    if (data.All_Symptoms) context += `- Treats Symptoms: ${data.All_Symptoms}\n`;
    if (data.Price) context += `- Approx Price: ₹${data.Price}\n`;
    if (data.Availability) context += `- Availability: ${data.Availability}\n`;
    context += `- Match Confidence: ${(result.score * 100).toFixed(1)}%\n\n`;
  });

  return `${PARENT_PROMPT}

${context}

Farmer's Question: "${query}"

INSTRUCTIONS:
1. First verify this is an animal health query. If not, refuse politely.
2. Use ONLY the medicine information provided above
3. Provide a structured, actionable response

FORMAT YOUR RESPONSE:

**🔍 Diagnosis Assessment**
What condition this likely is based on the symptoms/query

**💊 Recommended Medicine**
- Primary recommendation: [Medicine name from database]
- Why this medicine: [Explain based on disease/symptoms match]
- Alternative options: [If multiple matches exist]

**📋 Dosage & Administration**
- Form: [Tablet/Injection/Oral solution etc.]
- How to administer: [Specific practical instructions]
- Duration: [Typical treatment period]
- Important: [Any critical usage notes]

**🏥 Additional Care Instructions**
- Supportive care needed
- What to monitor
- Expected improvement timeline

**⚠️ When to Call Veterinarian**
- Warning signs requiring immediate attention
- Situations where home treatment is not enough

**🛡️ Prevention Tips**
- How to prevent recurrence
- General health maintenance

**💰 Cost Consideration**
[If price available, mention approximate cost]

RULES:
- Stay strictly within animal health context
- Use simple, farmer-friendly language
- Be specific about the medicines from the database
- Emphasize safety and professional consultation when needed
- If the query seems unrelated to animal health, refuse and explain your scope`;
}

// Get AI response from Gemini
async function getAIResponse(query, searchResults) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured");
    }
    console.log("🤖 Generating AI response with Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = createGeminiPrompt(query, searchResults);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("✅ AI response generated");
    return text;
  } catch (error) {
    console.error("❌ Gemini AI error:", error);
    return `I found ${searchResults.length} relevant medicine(s) for your query about "${query}".\n\nPlease consult with a veterinarian for proper diagnosis and treatment recommendations.`;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Livestock AI API is running",
    timestamp: new Date().toISOString(),
    database: db ? "connected" : "disconnected",
    ai: genAI ? "configured" : "not configured",
  });
});

// Generate embedding endpoint
app.post("/api/embed", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }
    console.log(`🧠 Generating embedding for: "${text.substring(0, 50)}..."`);
    const embedding = await generateEmbedding(text);
    res.json({ success: true, embedding, dimension: embedding.length });
  } catch (error) {
    console.error("❌ Embedding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { query, queryEmbedding, animalFilter, topK, minSimilarity } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    console.log(`\n🔍 Processing search query: "${query}"`);
    if (animalFilter) console.log(`🐄 Animal filter: ${animalFilter}`);

    let embedding = queryEmbedding;
    if (!embedding) {
      console.log("🧠 Generating embedding for query...");
      embedding = await generateEmbedding(query);
    }
    
    // Ensure it's a standard array, not a typed array which compute-cosine-similarity might hate
    const standardArrayEmbedding = Array.from(embedding);

    const searchResults = await searchMedicines(standardArrayEmbedding, {
      animalFilter: animalFilter || null,
      topK: topK || 5,
      minSimilarity: minSimilarity || 0.2,
    });

    console.log(`📊 Found ${searchResults.length} matching medicines`);
    const aiResponse = await getAIResponse(query, searchResults);

    const response = {
      success: true,
      query,
      animalFilter: animalFilter || null,
      medicinesFound: searchResults.length,
      searchResults: searchResults.map((r) => ({
        medicine: r.medicine_name,
        animal: r.animal_type,
        disease: r.disease,
        score: r.score,
        text: r.text,
        details: r.original_data,
      })),
      aiResponse,
    };

    console.log("✅ Search completed successfully\n");
    res.json(response);
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available animals endpoint
app.get("/api/animals", async (req, res) => {
  try {
    const animals = await collection.distinct("animal_type");
    res.json({ success: true, animals: animals.sort() });
  } catch (error) {
    console.error("❌ Error fetching animals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get statistics endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const totalRecords = await collection.countDocuments();
    const animals = await collection.distinct("animal_type");
    const diseases = await collection.distinct("disease");
    const medicines = await collection.distinct("medicine_name");
    res.json({
      success: true,
      stats: {
        totalRecords,
        totalAnimals: animals.length,
        totalDiseases: diseases.length,
        totalMedicines: medicines.length,
        animals: animals.sort(),
        topDiseases: diseases.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a sample record endpoint
app.get("/api/sample", async (req, res) => {
  try {
    const sample = await collection.findOne({});
    res.json({ success: true, sample });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /health",
      "POST /api/embed",
      "POST /api/search",
      "GET /api/animals",
      "GET /api/stats",
      "GET /api/sample",
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// Start server
async function startServer() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 Starting Livestock AI Medicine Finder Server");
    console.log("=".repeat(70) + "\n");

    await connectToMongoDB();
    await initializeEmbedder();

    app.listen(CONFIG.PORT, () => {
      console.log("\n" + "=".repeat(70));
      console.log("✅ Server Running Successfully!");
      console.log("=".repeat(70));
      console.log(`📍 Local:        http://localhost:${CONFIG.PORT}`);
      console.log(`📊 Health Check: http://localhost:${CONFIG.PORT}/health`);
      console.log(`📈 Statistics:   http://localhost:${CONFIG.PORT}/api/stats`);
      console.log("=".repeat(70));
      console.log("\n📋 Available Endpoints:");
      console.log("   POST /api/embed   - Generate text embeddings");
      console.log("   POST /api/search  - Search for medicines");
      console.log("   GET  /api/animals - Get available animals");
      console.log("   GET  /api/stats   - Get database statistics");
      console.log("   GET  /api/sample  - Get a sample record");
      console.log("=".repeat(70) + "\n");
    });
  } catch (error) {
    console.error("\n❌ Failed to start server:", error);
    console.error("Please check your configuration and try again.\n");
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  process.exit(0);
});

// Always start the server when this file is run directly
startServer();

export default app;