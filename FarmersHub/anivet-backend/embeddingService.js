import { pipeline } from '@xenova/transformers';

let embedder = null;

async function initializeEmbedder() {
  if (!embedder) {
    console.log("🧠 Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
    console.log(
      "⏳ This may take a moment on first run (downloading model)..."
    );

    try {
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      console.log("✅ Embedding model loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load embedding model:", error);
      throw error;
    }
  }
  return embedder;
}

async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Text must be a non-empty string");
    }

    const model = await initializeEmbedder();

    const output = await model(text, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);

    console.log(
      `✅ Generated embedding (${
        embedding.length
      } dimensions) for text: "${text.substring(0, 50)}..."`
    );

    return embedding;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    throw error;
  }
}

async function generateBatchEmbeddings(texts) {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts must be a non-empty array");
    }

    console.log(`🔄 Generating embeddings for ${texts.length} texts...`);

    const model = await initializeEmbedder();

    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const output = await model(text, {
          pooling: "mean",
          normalize: true,
        });
        return Array.from(output.data);
      })
    );

    console.log(`✅ Generated ${embeddings.length} embeddings`);

    return embeddings;
  } catch (error) {
    console.error("❌ Error generating batch embeddings:", error);
    throw error;
  }
}

function getEmbeddingDimension() {
  return 384;
}

function isInitialized() {
  return embedder !== null;
}

export {
  generateEmbedding,
  generateBatchEmbeddings,
  initializeEmbedder,
  getEmbeddingDimension,
  isInitialized,
};
