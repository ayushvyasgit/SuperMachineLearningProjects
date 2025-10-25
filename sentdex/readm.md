# 🎓 Livestock AI Medicine Finder - Complete Documentation

## 📚 Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Flow Diagram](#data-flow-diagram)
3. [Backend - embeddingService.js](#backend---embeddingservicejs)
4. [Backend - server.js](#backend---serverjs)
5. [Frontend - LivestockAIChat.jsx](#frontend---livestockaichatjsx)
6. [How Everything Works Together](#how-everything-works-together)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       USER INTERFACE                         │
│                  (React Frontend - Port 3000)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Request: 
                     │ "My cow has fever"
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS API SERVER                         │
│                  (Node.js Backend - Port 5000)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Generate Embedding (384 dimensions)              │   │
│  │     Input: "My cow has fever"                        │   │
│  │     Output: [0.234, -0.567, 0.123, ...]             │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. Vector Search in MongoDB                         │   │
│  │     - Compare query embedding with 20,480 records    │   │
│  │     - Find top 5 most similar medicines              │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. Send Context to Gemini AI                        │   │
│  │     - Query + Found medicines                        │   │
│  │     - Get natural language response                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ JSON Response:
                     │ {medicines, aiResponse}
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                           │
│              (React displays medicines + advice)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
USER TYPES QUERY
      ↓
[Generate Embedding] ──→ "My cow has fever" becomes [0.234, -0.567, ...]
      ↓
[Vector Search]
      ↓
MongoDB compares query embedding with stored embeddings
      ↓
┌─────────────────────────────────────────┐
│ Record 1: Cow + Fever → Score: 0.85    │ ← High similarity!
│ Record 2: Cow + Cold  → Score: 0.72    │
│ Record 3: Dog + Fever → Score: 0.45    │ ← Lower similarity
└─────────────────────────────────────────┘
      ↓
Take top 5 matches
      ↓
[Send to Gemini AI]
      ↓
"Based on these medicines, here's my advice..."
      ↓
[Display to User]
```

---

## 📄 Backend - embeddingService.js

### Purpose
Converts text into numerical vectors (embeddings) that can be compared mathematically.

### Line-by-Line Explanation

```javascript
// ============================================================================
// Line 1-2: Import the Transformers.js library
// This library allows us to run AI models directly in Node.js
// ============================================================================
const { pipeline } = require('@xenova/transformers');

// ============================================================================
// Line 4: Global variable to store the model
// We only want to load the model once (it's 90MB!), so we cache it
// ============================================================================
let embedder = null;

// ============================================================================
// FUNCTION: initializeEmbedder()
// Purpose: Load the embedding model from Hugging Face
// Called: Once when server starts
// Returns: The loaded model
// ============================================================================
async function initializeEmbedder() {
  // Line 1: Check if model is already loaded
  // If embedder is null, we need to load it
  if (!embedder) {
    // Line 2: Log that we're loading (this takes 10-30 seconds first time)
    console.log('🧠 Loading embedding model...');
    
    // Line 3-4: Load the 'all-MiniLM-L6-v2' model
    // - 'feature-extraction': This is the task type (convert text to numbers)
    // - 'Xenova/all-MiniLM-L6-v2': The specific model (384-dimensional embeddings)
    // This model downloads ~90MB on first run
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    // Line 5: Confirm model is loaded
    console.log('✅ Embedding model loaded');
  }
  
  // Line 6: Return the model (whether just loaded or already cached)
  return embedder;
}

// ============================================================================
// FUNCTION: generateEmbedding(text)
// Purpose: Convert a single text string into a 384-dimensional vector
// Example: "My cow has fever" → [0.234, -0.567, 0.123, ..., 0.891]
// 
// HOW IT WORKS:
// 1. Text goes through a neural network
// 2. Network understands semantic meaning
// 3. Outputs 384 numbers that represent the meaning
// 4. Similar texts have similar numbers
// ============================================================================
async function generateEmbedding(text) {
  try {
    // Line 1: Get the loaded model (or load it if not loaded)
    const model = await initializeEmbedder();
    
    // Line 2-3: Generate the embedding
    // - model(text): Pass text through neural network
    // - pooling: 'mean': Average all word embeddings into one sentence embedding
    // - normalize: true: Scale vector to length 1 (for cosine similarity)
    const output = await model(text, { pooling: 'mean', normalize: true });
    
    // Line 4: Convert from Tensor to JavaScript array
    // output.data is a Float32Array, we convert to regular array
    // Result: [0.234, -0.567, 0.123, ..., 0.891] (384 numbers)
    return Array.from(output.data);
    
  } catch (error) {
    // Line 5-7: If anything fails, log and throw error
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// ============================================================================
// FUNCTION: generateBatchEmbeddings(texts)
// Purpose: Generate embeddings for multiple texts at once (faster)
// Example: ["cow fever", "dog cough"] → [array1, array2]
// ============================================================================
async function generateBatchEmbeddings(texts) {
  try {
    // Line 1: Get model
    const model = await initializeEmbedder();
    
    // Line 2-4: Process each text in parallel using Promise.all
    // This is MUCH faster than doing them one by one
    const embeddings = await Promise.all(
      texts.map(text => model(text, { pooling: 'mean', normalize: true }))
    );
    
    // Line 5: Convert all Tensors to arrays
    return embeddings.map(output => Array.from(output.data));
    
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}

// ============================================================================
// Export functions so server.js can use them
// ============================================================================
module.exports = {
  generateEmbedding,
  generateBatchEmbeddings,
  initializeEmbedder
};
```

### 🎯 Key Concepts

#### What is an Embedding?
```javascript
// Text (humans understand)
"My cow has fever"

// Embedding (computers understand)
[0.234, -0.567, 0.123, 0.445, -0.221, ..., 0.891]
// ↑ 384 numbers total

// Why 384 numbers?
// Each number represents a different aspect of meaning:
// - Position 0-50: Animal-related concepts
// - Position 51-100: Symptom-related concepts
// - Position 101-150: Action-related concepts
// ... and so on
```

#### Why Normalize?
```javascript
// Without normalization:
Vector A: [100, 200, 300]  // Length = 374
Vector B: [1, 2, 3]        // Length = 3.74

// With normalization (length = 1):
Vector A: [0.267, 0.534, 0.801]
Vector B: [0.267, 0.534, 0.801]

// Now we can use cosine similarity accurately!
```

---

## 📄 Backend - server.js

### Purpose
Main API server that handles requests, searches MongoDB, and generates AI responses.

### Line-by-Line Explanation

```javascript
// ============================================================================
// SECTION 1: IMPORTS
// ============================================================================

// Line 1: Express - Web framework for creating API endpoints
const express = require('express');

// Line 2: CORS - Allows frontend (localhost:3000) to talk to backend (localhost:5000)
const cors = require('cors');

// Line 3: MongoDB Client - Database driver for connecting to MongoDB Atlas
const { MongoClient } = require('mongodb');

// Line 4: Google Generative AI - For Gemini AI integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Line 5: Import our embedding functions from embeddingService.js
const { generateEmbedding, initializeEmbedder } = require('./embeddingService');

// Line 6: Load environment variables from .env file
require('dotenv').config();

// ============================================================================
// SECTION 2: CREATE EXPRESS APP
// ============================================================================

const app = express();

// Line 1: Enable CORS (Cross-Origin Resource Sharing)
// Without this, browser blocks requests from React (port 3000) to API (port 5000)
app.use(cors());

// Line 2: Parse JSON request bodies
// Converts incoming JSON to JavaScript objects
app.use(express.json());

// ============================================================================
// SECTION 3: CONFIGURATION
// Read from .env file or use defaults
// ============================================================================

const CONFIG = {
  // MongoDB connection string
  // Format: mongodb://username:password@host1:port1,host2:port2,host3:port3/?options
  MONGO_URI: process.env.MONGO_URI,
  
  // Database name in MongoDB
  DATABASE_NAME: "livestock_ai_db",
  
  // Collection name (like a table in SQL)
  COLLECTION_NAME: "medicine_records",
  
  // Gemini AI API key from Google
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Port for API server
  PORT: process.env.PORT || 5000
};

// ============================================================================
// SECTION 4: GLOBAL VARIABLES
// These are accessible throughout the file
// ============================================================================

// Database and collection references
let db, collection;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

// ============================================================================
// FUNCTION: initialize()
// Purpose: Connect to MongoDB and load embedding model
// Called: When server starts
// ============================================================================

async function initialize() {
  try {
    // STEP 1: Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    
    // Create MongoDB client with timeout settings
    const client = new MongoClient(CONFIG.MONGO_URI, {
      // Wait 30 seconds for server selection
      serverSelectionTimeoutMS: 30000,
      // Wait 120 seconds for operations
      socketTimeoutMS: 120000,
    });
    
    // Actually connect to MongoDB
    await client.connect();
    
    // Get reference to database
    db = client.db(CONFIG.DATABASE_NAME);
    
    // Get reference to collection (where our 20,480 records are)
    collection = db.collection(CONFIG.COLLECTION_NAME);
    
    console.log('✅ MongoDB connected');

    // STEP 2: Load embedding model
    console.log('🧠 Loading embedding model...');
    await initializeEmbedder();
    console.log('✅ Embedding model ready');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

// ============================================================================
// FUNCTION: cosineSimilarity(vecA, vecB)
// Purpose: Calculate how similar two vectors are
// Returns: Number from 0 to 1 (1 = identical, 0 = completely different)
//
// HOW IT WORKS:
// Imagine vectors as arrows in 384-dimensional space
// Cosine similarity measures the angle between them
// Small angle = similar meaning = high score
// ============================================================================

function cosineSimilarity(vecA, vecB) {
  // STEP 1: Calculate dot product
  // Multiply corresponding numbers and sum them
  // [1,2,3] · [4,5,6] = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  
  // STEP 2: Calculate magnitude of vector A
  // √(a₁² + a₂² + a₃² + ...)
  // This is the "length" of the vector
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  
  // STEP 3: Calculate magnitude of vector B
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  // STEP 4: Calculate cosine similarity
  // Formula: cos(θ) = (A · B) / (|A| × |B|)
  // This gives us a number between -1 and 1
  // We normalize it to 0-1 range by using normalized vectors
  return dotProduct / (magA * magB);
}

// ============================================================================
// FUNCTION: searchWithFallback(queryEmbedding, options)
// Purpose: Search for similar medicines in MongoDB
// Strategy: Try Vector Search first, fall back to manual search if it fails
//
// WHY TWO METHODS?
// - Vector Search: Fast, requires Atlas Search Index (may not be set up yet)
// - Fallback: Slower, works without any setup
// ============================================================================

async function searchWithFallback(queryEmbedding, options) {
  try {
    // ========================================================================
    // METHOD 1: MongoDB Atlas Vector Search
    // This is FAST (milliseconds) because MongoDB has optimized indexes
    // ========================================================================
    
    console.log('🔍 Attempting Vector Search...');
    
    // Build aggregation pipeline
    // Think of this as a series of steps MongoDB performs
    const pipeline = [
      // STEP 1: Vector Search
      {
        $vectorSearch: {
          // Name of the index we created in Atlas UI
          index: "vector_index",
          
          // Field in documents that contains embeddings
          path: "embedding",
          
          // Our query embedding (384 numbers)
          queryVector: queryEmbedding,
          
          // How many candidates to consider (more = slower but more accurate)
          numCandidates: 200,
          
          // Return top matches (we'll filter more later)
          limit: options.topK * 2
        }
      },
      
      // STEP 2: Project only fields we need
      // This reduces data transfer and speeds up response
      {
        $project: {
          text: 1,              // Full text description
          animal_type: 1,       // "cow", "dog", etc.
          disease: 1,           // Disease name
          medicine_name: 1,     // Medicine name
          original_data: 1,     // All CSV columns
          score: { $meta: "vectorSearchScore" }  // Similarity score from search
        }
      }
    ];

    // STEP 3: Add animal filter if specified
    // If user selected "cow", only show cow medicines
    if (options.animalFilter) {
      // Insert filter between vector search and project
      pipeline.splice(1, 0, {
        $match: { 
          animal_type: options.animalFilter.toLowerCase() 
        }
      });
    }

    // Execute the search
    const results = await collection.aggregate(pipeline).toArray();
    
    console.log(`✅ Vector Search found ${results.length} results`);
    
    // Filter by minimum similarity and return top K
    return results
      .filter(r => r.score >= options.minSimilarity)
      .slice(0, options.topK);

  } catch (error) {
    // ========================================================================
    // METHOD 2: Fallback - Manual Cosine Similarity
    // If Vector Search fails (index not set up), do it ourselves
    // This is SLOWER but doesn't require any setup
    // ========================================================================
    
    console.log('⚠️  Vector Search failed, using fallback...');
    console.log('   (This is slower - set up Atlas Vector Search Index for better performance)');
    
    // STEP 1: Build filter query
    const filter = options.animalFilter ? 
      { animal_type: options.animalFilter.toLowerCase() } : {};
    
    // STEP 2: Fetch ALL matching records from database
    // ⚠️ This loads 20,480 records if no filter! That's why it's slow.
    const records = await collection.find(filter).toArray();
    
    console.log(`📊 Comparing against ${records.length} records...`);
    
    // STEP 3: Calculate similarity for EACH record manually
    const resultsWithScores = records.map(record => {
      // Calculate cosine similarity between query and this record
      const similarity = cosineSimilarity(queryEmbedding, record.embedding);
      
      return {
        ...record,  // Keep all original data
        score: similarity  // Add similarity score
      };
    });

    // STEP 4: Filter by minimum similarity
    const filtered = resultsWithScores.filter(r => r.score >= options.minSimilarity);
    
    // STEP 5: Sort by score (highest first)
    filtered.sort((a, b) => b.score - a.score);
    
    // STEP 6: Return top K results
    return filtered.slice(0, options.topK);
  }
}

// ============================================================================
// FUNCTION: createGeminiPrompt(query, searchResults)
// Purpose: Create a detailed prompt for Gemini AI
// 
// PROMPT ENGINEERING:
// We give Gemini:
// 1. Context (who it is)
// 2. Data (search results)
// 3. Question (user's query)
// 4. Instructions (how to respond)
// ============================================================================

function createGeminiPrompt(query, searchResults) {
  // CASE 1: No medicines found
  if (!searchResults || searchResults.length === 0) {
    return `You are a veterinary medicine expert assistant for farmers.

The farmer asked: "${query}"

Unfortunately, I couldn't find specific medicine recommendations in the database.

Please provide general veterinary advice:
1. What this condition might be
2. General care recommendations
3. When to consult a veterinarian
4. Any immediate actions the farmer should take

Keep the response practical, clear, and farmer-friendly.`;
  }

  // CASE 2: Medicines found - Build detailed context
  
  // Start building context string
  let context = "Here is relevant veterinary medicine information:\n\n";
  
  // Add each medicine result
  searchResults.forEach((result, i) => {
    const data = result.original_data || {};
    
    // Format as numbered options
    context += `Option ${i + 1}:\n`;
    context += `- Animal: ${result.animal_type || 'N/A'}\n`;
    context += `- Disease: ${result.disease || 'N/A'}\n`;
    context += `- Medicine: ${result.medicine_name || 'N/A'}\n`;
    
    // Add optional details if available
    if (data.Medicine_Category) context += `- Type: ${data.Medicine_Category}\n`;
    if (data.Dosage_Form) context += `- Form: ${data.Dosage_Form}\n`;
    if (data.Strength_mg) context += `- Strength: ${data.Strength_mg} mg\n`;
    if (data.Manufacturer) context += `- Manufacturer: ${data.Manufacturer}\n`;
    if (data.All_Symptoms) context += `- Symptoms: ${data.All_Symptoms}\n`;
    
    // Show match score (helps AI understand relevance)
    context += `- Match Score: ${(result.score * 100).toFixed(1)}%\n\n`;
  });

  // Return complete prompt with instructions
  return `You are an expert veterinary assistant helping farmers care for their livestock.

${context}

Farmer's Question: "${query}"

Based on the information above, provide a clear, practical answer that includes:

1. **Diagnosis Confirmation**: What the condition likely is
2. **Recommended Medicine**: Which medicine to use and why
3. **Dosage & Administration**: How to give it (be specific)
4. **Additional Care**: Other things the farmer should do
5. **Warning Signs**: When to call a veterinarian immediately
6. **Prevention**: How to prevent this in the future

Keep your response clear, practical, and farmer-friendly.`;
}

// ============================================================================
// FUNCTION: getAIResponse(query, searchResults)
// Purpose: Send prompt to Gemini AI and get response
// ============================================================================

async function getAIResponse(query, searchResults) {
  try {
    console.log('🤖 Asking Gemini AI...');
    
    // STEP 1: Get Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // STEP 2: Create prompt with context
    const prompt = createGeminiPrompt(query, searchResults);
    
    // STEP 3: Generate response
    // This sends prompt to Google's servers and waits for response
    const result = await model.generateContent(prompt);
    
    // STEP 4: Extract text from response
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI response received');
    
    return text;
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    throw error;
  }
}

// ============================================================================
// API ENDPOINT: GET /health
// Purpose: Check if server is running
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Livestock AI API is running' 
  });
});

// ============================================================================
// API ENDPOINT: POST /api/embed
// Purpose: Generate embedding for any text
// Request body: { text: "My cow has fever" }
// Response: { success: true, embedding: [...], dimension: 384 }
// ============================================================================

app.post('/api/embed', async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;
    
    // Validation: text is required
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text is required' 
      });
    }

    // Generate embedding
    const embedding = await generateEmbedding(text);
    
    // Return success response
    res.json({ 
      success: true, 
      embedding,
      dimension: embedding.length 
    });

  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================================================
// API ENDPOINT: POST /api/search
// Purpose: Main search endpoint - THE HEART OF THE APPLICATION
// 
// REQUEST FLOW:
// 1. Receive query from frontend
// 2. Generate embedding if not provided
// 3. Search MongoDB for similar medicines
// 4. Send results to Gemini AI
// 5. Return medicines + AI advice
// ============================================================================

app.post('/api/search', async (req, res) => {
  try {
    // STEP 1: Extract parameters from request
    const { 
      query,          // User's question: "My cow has fever"
      queryEmbedding, // Optional: pre-generated embedding
      animalFilter,   // Optional: "cow", "dog", etc.
      topK,           // Optional: how many results (default 5)
      minSimilarity   // Optional: minimum score (default 0.2)
    } = req.body;

    // STEP 2: Validate required parameters
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`\n🔍 Processing query: "${query}"`);
    if (animalFilter) console.log(`🐄 Filtered by: ${animalFilter}`);

    // STEP 3: Generate embedding if not provided
    let embedding = queryEmbedding;
    if (!embedding) {
      console.log('🧠 Generating embedding...');
      embedding = await generateEmbedding(query);
      console.log('✅ Embedding generated');
    }

    // STEP 4: Search for similar medicines
    console.log('📊 Searching database...');
    const searchResults = await searchWithFallback(embedding, {
      animalFilter: animalFilter || null,
      topK: topK || 5,
      minSimilarity: minSimilarity || 0.2
    });
    
    console.log(`✅ Found ${searchResults.length} medicines`);

    // STEP 5: Get AI response
    console.log('🤖 Generating AI response...');
    const aiResponse = await getAIResponse(query, searchResults);
    console.log('✅ AI response ready');

    // STEP 6: Format and return response
    res.json({
      success: true,
      query,
      animalFilter,
      medicinesFound: searchResults.length,
      
      // Simplify search results for frontend
      searchResults: searchResults.map(r => ({
        medicine: r.medicine_name,
        animal: r.animal_type,
        disease: r.disease,
        score: r.score,
        text: r.text,
        details: r.original_data
      })),
      
      // AI-generated advice
      aiResponse
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// API ENDPOINT: GET /api/animals
// Purpose: Get list of available animals for dropdown filter
// ============================================================================

app.get('/api/animals', async (req, res) => {
  try {
    // Get unique animal types from database
    // distinct() returns array of unique values
    const animals = await collection.distinct('animal_type');
    
    res.json({ success: true, animals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// API ENDPOINT: GET /api/stats
// Purpose: Get database statistics for dashboard
// ============================================================================

app.get('/api/stats', async (req, res) => {
  try {
    // Count total records
    const totalRecords = await collection.countDocuments();
    
    // Get unique animals and diseases
    const animals = await collection.distinct('animal_type');
    const diseases = await collection.distinct('disease');
    
    res.json({
      success: true,
      stats: {
        totalRecords,
        totalAnimals: animals.length,
        totalDiseases: diseases.length,
        animals,
        topDiseases: diseases.slice(0, 10)  // First 10 diseases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

// Initialize everything, then start listening for requests
initialize()
  .then(() => {
    // Start Express server on configured port
    app.listen(CONFIG.PORT, () => {
      console.log(`\n${"=".repeat(70)}`);
      console.log(`🚀 Livestock AI API Server Running`);
      console.log(`${"=".repeat(70)}`);
      console.log(`📍 URL:      http://localhost:${CONFIG.PORT}`);
      console.log(`🔍 Search:   POST /api/search`);
      console.log(`🧠 Embed:    POST /api/embed`);
      console.log(`📊 Stats:    GET /api/stats`);
      console.log(`${"=".repeat(70)}\n`);
      console.log('✅ Server ready to receive requests!');
    });
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);  // Exit with error code
  });
```

---

## 📄 Frontend - LivestockAIChat.jsx

### Purpose
React component that provides chat interface for users to interact with the AI.

### Line-by-Line Explanation

```javascript
// ============================================================================
// IMPORTS
// ============================================================================

// React hooks for state management and side effects
import React, { useState, useEffect, useRef } from 'react';

// axios - HTTP client for making API requests
import axios from 'axios';

// ReactMarkdown - Renders markdown text with formatting
import ReactMarkdown from 'react-markdown';

// ============================================================================
// COMPONENT: LivestockAIChat
// ============================================================================

const LivestockAIChat = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // useState creates a state variable that triggers re-render when changed
  // ==========================================================================
  
  // User's current query input
  const [query, setQuery] = useState('');
  
  // Selected animal filter ("", "cow", "dog", etc.)
  const [animalFilter, setAnimalFilter] = useState('');
  
  // Array of all chat messages
  const [messages, setMessages] = useState([]);
  
  // Is API request in progress?
  const [loading, setLoading] = useState(false);
  
  // Available animals for dropdown (loaded from API)
  const [animals, setAnimals] = useState([]);
  
  // Reference to scroll container (for auto-scroll)
  const messagesEndRef = useRef(null);

  // API base URL (from environment variable or default)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';