"""
STEP 2: Generate Embeddings and Store in MongoDB
================================================
This script:
1. Loads your cleaned livestock medicine dataset
2. Creates context text for each record
3. Generates embeddings using Sentence Transformers
4. Stores everything in MongoDB

Prerequisites:
pip install sentence-transformers pymongo pandas numpy tqdm
"""

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from tqdm import tqdm
import json

 
 
 

 
INPUT_CSV = "./dataset/farmer_medicine_finder.csv"

 
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "livestock_ai_db"
COLLECTION_NAME = "medicine_records"

 
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'   

 
 
 

print("=" * 70)
print("🐄 LIVESTOCK AI - STEP 2: EMBEDDING GENERATION")
print("=" * 70)

print("\n📂 Loading dataset...")
df = pd.read_csv(INPUT_CSV)
print(f"✅ Loaded {len(df)} records")
print(f"✅ Columns: {list(df.columns)}")

 
 
 

print("\n📝 Creating context text for each record...")

def create_context(row):
    """
    Creates a rich context string that combines all important information.
    This will be embedded and used for similarity search.
    """
    parts = []
    
 
    if pd.notna(row.get('Animal_Type')):
        parts.append(f"Animal: {row['Animal_Type']}")
    if pd.notna(row.get('Breed')):
        parts.append(f"Breed: {row['Breed']}")
    
 
    symptoms = []
    if pd.notna(row.get('All_Symptoms')):
        symptoms.append(row['All_Symptoms'])
    if symptoms:
        parts.append(f"Symptoms: {', '.join(symptoms)}")
    
 
    if pd.notna(row.get('Disease')):
        parts.append(f"Disease: {row['Disease']}")
    
 
    if pd.notna(row.get('Medicine_Name')):
        parts.append(f"Medicine: {row['Medicine_Name']}")
    if pd.notna(row.get('Medicine_Category')):
        parts.append(f"Type: {row['Medicine_Category']}")
    if pd.notna(row.get('Dosage_Form')):
        parts.append(f"Form: {row['Dosage_Form']}")
    
 
    if pd.notna(row.get('Body_Temperature')):
        parts.append(f"Temperature: {row['Body_Temperature']}°C")
    
    return ". ".join(parts) + "."

 
print("🔄 Processing records...")
df['context'] = df.apply(create_context, axis=1)

print("\n✅ Sample contexts:")
for i in range(min(3, len(df))):
    print(f"\n{i+1}. {df.iloc[i]['context'][:200]}...")

 
 
 

print("\n🧠 Loading embedding model...")
model = SentenceTransformer(EMBEDDING_MODEL)
print(f"✅ Model loaded: {EMBEDDING_MODEL}")
print(f"✅ Embedding dimension: {model.get_sentence_embedding_dimension()}")

print("\n🔄 Generating embeddings (this may take a few minutes)...")

 
embeddings = []
batch_size = 32   

for i in tqdm(range(0, len(df), batch_size), desc="Embedding"):
    batch = df['context'].iloc[i:i+batch_size].tolist()
    batch_embeddings = model.encode(batch, show_progress_bar=False)
    embeddings.extend(batch_embeddings)

df['embedding'] = [emb.tolist() for emb in embeddings]

print(f"✅ Generated {len(embeddings)} embeddings")

 
 
 

print("\n🗄️  Connecting to MongoDB...")

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
 
    print("🧹 Clearing existing data...")
    collection.delete_many({})
    
    print("📤 Uploading to MongoDB...")
    
 
    records = df.to_dict('records')
    
 
    batch_size = 100
    for i in tqdm(range(0, len(records), batch_size), desc="Uploading"):
        batch = records[i:i+batch_size]
        collection.insert_many(batch)
    
    print(f"\n✅ Successfully stored {len(records)} records in MongoDB")
    
 
    print("📊 Creating indexes...")
    collection.create_index([("Animal_Type", 1)])
    collection.create_index([("Disease", 1)])
    collection.create_index([("Medicine_Category", 1)])
    print("✅ Indexes created")
    
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
    print("\n💡 Make sure MongoDB is running:")
    print("   - Install: https://www.mongodb.com/try/download/community")
    print("   - Start: mongod")
    exit(1)

 
 
 

print("\n🔍 Verifying stored data...")

sample = collection.find_one()
if sample:
    print("\n✅ Sample document structure:")
 
    sample_display = {k: v for k, v in sample.items() if k != 'embedding'}
    print(json.dumps(sample_display, indent=2, default=str))
    print(f"   Embedding dimension: {len(sample['embedding'])}")

 
print("\n📊 Database Statistics:")
print(f"   Total records: {collection.count_documents({})}")
print(f"   Unique animals: {len(collection.distinct('Animal_Type'))}")
print(f"   Unique diseases: {len(collection.distinct('Disease'))}")
print(f"   Unique medicines: {len(collection.distinct('Medicine_Name'))}")

 
 
 

metadata = {
    "model_name": EMBEDDING_MODEL,
    "embedding_dimension": model.get_sentence_embedding_dimension(),
    "total_records": len(df),
    "database": DATABASE_NAME,
    "collection": COLLECTION_NAME,
    "animals": df['Animal_Type'].unique().tolist(),
    "medicine_categories": df['Medicine_Category'].unique().tolist()
}

with open('./dataset/embedding_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n💾 Metadata saved to: ./dataset/embedding_metadata.json")

print("\n" + "=" * 70)
print("✅ STEP 2 COMPLETE!")
print("=" * 70)
print("\n📌 Next Steps:")
print("   1. Run 'step3_query_search.py' to test similarity search")
print("   2. Run 'step4_gemini_integration.py' to add AI responses")
print("=" * 70)