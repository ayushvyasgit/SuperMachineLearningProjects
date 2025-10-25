""" 3 
Livestock Medicine Vector Embedding + MongoDB Atlas Upload
===========================================================
For pre-formatted text strings (one record per string)

Requirements:
pip install pandas numpy sentence-transformers pymongo tqdm python-dotenv
"""

import os
import sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from tqdm import tqdm
import json
from pathlib import Path
import time

 
 
 
 
 

 
MONGO_URI = os.getenv("MONGO_URI", "mongodb://ayushvyas99199:qegXvJWDh8bkgI1Q@ac-qcctrua-shard-00-00.mihxsrj.mongodb.net:27017,ac-qcctrua-shard-00-01.mihxsrj.mongodb.net:27017,ac-qcctrua-shard-00-02.mihxsrj.mongodb.net:27017/?ssl=true&replicaSet=atlas-13gqys-shard-0&authSource=admin&retryWrites=true&w=majority")
INPUT_CSV = os.getenv("INPUT_CSV", "./dataset/farmer_medicine_finder.csv")
DATABASE_NAME = "livestock_ai_db"
COLLECTION_NAME = "medicine_records"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   
EMBEDDING_BATCH_SIZE = 100
UPLOAD_BATCH_SIZE = 500


def validate_environment():
    """Check if all required environment variables are set"""
    if not Path(INPUT_CSV).exists():
        print(f"❌ Error: Input file not found: {INPUT_CSV}")
        sys.exit(1)


def create_text_string(row):
    """
    Convert CSV row to formatted text string
    Example output:
    "Medicine: acetocillin (antipyretic, drops, Price: 202.0, Availability: over-the-counter, 
    Manufacturer: novo nordisk a/s). Animal: cow (holstein, Age: 7, Gender: female, Weight: 650.0). 
    Symptoms: coughing, nasal discharge, appetite loss, fever. Disease: bovine tuberculosis. 
    Temperature: 39.4°C, Score: 79."
    """
    parts = []
    
 
    medicine_parts = []
    if pd.notna(row.get('Medicine_Name')):
        medicine_parts.append(row['Medicine_Name'])
    
    medicine_details = []
    if pd.notna(row.get('Medicine_Category')):
        medicine_details.append(row['Medicine_Category'])
    if pd.notna(row.get('Dosage_Form')):
        medicine_details.append(row['Dosage_Form'])
    if pd.notna(row.get('Price')):
        medicine_details.append(f"Price: {row['Price']}")
    if pd.notna(row.get('Availability')):
        medicine_details.append(f"Availability: {row['Availability']}")
    if pd.notna(row.get('Manufacturer')):
        medicine_details.append(f"Manufacturer: {row['Manufacturer']}")
    
    if medicine_parts:
        medicine_str = medicine_parts[0]
        if medicine_details:
            medicine_str += f" ({', '.join(medicine_details)})"
        parts.append(f"Medicine: {medicine_str}")
    
 
    animal_parts = []
    if pd.notna(row.get('Animal_Type')):
        animal_parts.append(row['Animal_Type'])
    
    animal_details = []
    if pd.notna(row.get('Breed')):
        animal_details.append(row['Breed'])
    if pd.notna(row.get('Age')):
        animal_details.append(f"Age: {row['Age']}")
    if pd.notna(row.get('Gender')):
        animal_details.append(f"Gender: {row['Gender']}")
    if pd.notna(row.get('Weight')):
        animal_details.append(f"Weight: {row['Weight']}")
    
    if animal_parts:
        animal_str = animal_parts[0]
        if animal_details:
            animal_str += f" ({', '.join(animal_details)})"
        parts.append(f"Animal: {animal_str}")
    
 
    symptoms = []
    if pd.notna(row.get('All_Symptoms')):
        symptoms_str = row['All_Symptoms']
        parts.append(f"Symptoms: {symptoms_str}")
    else:
 
        for i in range(1, 5):
            col = f'Symptom_{i}'
            if col in row and pd.notna(row[col]):
                symptoms.append(row[col])
        if symptoms:
            parts.append(f"Symptoms: {', '.join(symptoms)}")
    
 
    if pd.notna(row.get('Disease')):
        parts.append(f"Disease: {row['Disease']}")
    
 
    metrics = []
    if pd.notna(row.get('Body_Temperature')):
        metrics.append(f"Temperature: {row['Body_Temperature']}°C")
    if pd.notna(row.get('Heart_Rate')):
        metrics.append(f"Heart Rate: {row['Heart_Rate']}")
    if pd.notna(row.get('Score')):
        metrics.append(f"Score: {row['Score']}")
    
    if metrics:
        parts.append(', '.join(metrics))
    
    return '. '.join(parts) + '.' if parts else "No data available."


def load_data(csv_path):
    """Load CSV and create text strings"""
    print("📂 Loading dataset...")
    try:
        df = pd.read_csv(csv_path)
        print(f"✅ Loaded {len(df)} records")
        print(f"📋 Columns: {list(df.columns)}")
        return df
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        sys.exit(1)


def generate_embeddings(texts, model, batch_size=EMBEDDING_BATCH_SIZE):
    """Generate embeddings in batches"""
    print(f"🔄 Generating embeddings in batches of {batch_size}...")
    all_embeddings = []
    
    for i in tqdm(range(0, len(texts), batch_size)):
        batch = texts[i:i + batch_size]
        embeddings = model.encode(batch, show_progress_bar=False)
        all_embeddings.extend([emb.tolist() for emb in embeddings])
    
    return all_embeddings


def test_connection(uri):
    """Test MongoDB connection with optimized settings"""
    print("🔌 Testing MongoDB connection...")
    try:
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=30000,
            socketTimeoutMS=120000,
            connectTimeoutMS=30000,
            maxPoolSize=10,
            retryWrites=True,
            w='majority'
        )
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        return client
    except ConnectionFailure as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        sys.exit(1)


def upload_in_batches(collection, records, batch_size=UPLOAD_BATCH_SIZE):
    """Upload records in batches with error handling"""
    total = len(records)
    inserted = 0
    failed_records = []
    
    print(f"📤 Uploading {total} records in batches of {batch_size}...")
    
    for i in tqdm(range(0, total, batch_size), desc="Uploading batches"):
        batch = records[i:i + batch_size]
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                result = collection.insert_many(batch, ordered=False)
                inserted += len(result.inserted_ids)
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"\n❌ Batch {i//batch_size + 1} failed after {max_retries} attempts")
                    print(f"   Trying individual inserts...")
                    for record in batch:
                        try:
                            collection.insert_one(record)
                            inserted += 1
                        except Exception as e2:
                            failed_records.append(record)
                else:
                    wait_time = 2 ** attempt
                    print(f"\n⚠️  Retry {attempt + 1}/{max_retries} after {wait_time}s...")
                    time.sleep(wait_time)
    
    if failed_records:
        print(f"\n⚠️  {len(failed_records)} records failed to insert")
        failed_path = Path('./dataset/failed_records.json')
        with open(failed_path, 'w') as f:
            json.dump(failed_records, f, indent=2, default=str)
        print(f"   Failed records saved to: {failed_path}")
    
    return inserted


def create_vector_search_index():
    """Instructions for creating vector search index"""
    print("\n📊 Vector Search Index Setup:")
    print("=" * 60)
    print("Go to MongoDB Atlas UI > Database > Search")
    print("Create Search Index with this definition:")
    print("""
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "animal_type"
    },
    {
      "type": "filter", 
      "path": "disease"
    }
  ]
}
    """)
    print("Name it: vector_index")
    print("=" * 60)


def extract_structured_data(text_string):
    """Extract structured fields from text string for filtering"""
    data = {}
    
 
    if "Animal: " in text_string:
        animal_part = text_string.split("Animal: ")[1].split(".")[0]
        animal_type = animal_part.split("(")[0].strip()
        data['animal_type'] = animal_type
    
 
    if "Disease: " in text_string:
        disease_part = text_string.split("Disease: ")[1].split(".")[0]
        data['disease'] = disease_part.strip()
    
 
    if "Medicine: " in text_string:
        medicine_part = text_string.split("Medicine: ")[1].split("(")[0]
        data['medicine_name'] = medicine_part.strip()
    
    return data


def perform_sample_search(collection, model, query_text="cow with fever and coughing"):
    """Perform a sample vector search"""
    print(f"\n🔍 Sample search: '{query_text}'")
    
    try:
        query_embedding = model.encode([query_text])[0].tolist()
        
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": 3
                }
            },
            {
                "$project": {
                    "text": 1,
                    "animal_type": 1,
                    "disease": 1,
                    "medicine_name": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        if results:
            print("\n📋 Top 3 matches:")
            for i, doc in enumerate(results, 1):
                print(f"\n{i}. Score: {doc.get('score', 'N/A'):.4f}")
                print(f"   {doc.get('text', 'N/A')[:200]}...")
        else:
            print("⚠️  No results. Make sure vector search index is created in Atlas UI.")
            
    except OperationFailure as e:
        print(f"⚠️  Vector search not available yet: {str(e)[:100]}")
        print("   Create the vector index in MongoDB Atlas UI first.")


def main():
    """Main execution flow"""
    print("=" * 60)
    print("Livestock Medicine Vector Database Setup")
    print("(Text String Format)")
    print("=" * 60)
    
    validate_environment()
    
 
    df = load_data(INPUT_CSV)
    
 
    print("\n📝 Creating formatted text strings...")
    df['text'] = df.apply(create_text_string, axis=1)
    
 
    print("\n📄 Sample text string:")
    print("-" * 60)
    print(df['text'].iloc[0])
    print("-" * 60)
    
 
    print(f"\n🧠 Loading embedding model: {EMBEDDING_MODEL}...")
    try:
        model = SentenceTransformer(EMBEDDING_MODEL)
        embedding_dim = model.get_sentence_embedding_dimension()
        print(f"✅ Model loaded (dimension: {embedding_dim})")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        sys.exit(1)
    
 
    embeddings = generate_embeddings(df['text'].tolist(), model)
    print(f"✅ Generated {len(embeddings)} embeddings")
    
 
    print("\n🔧 Preparing records...")
    records = []
    for idx, row in df.iterrows():
        text = row['text']
        structured = extract_structured_data(text)
        
        record = {
            'text': text,
            'embedding': embeddings[idx],
            **structured,   
            'original_data': row.to_dict()   
        }
        records.append(record)
    
 
    client = test_connection(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
 
    print(f"\n🗄️  Preparing collection '{COLLECTION_NAME}'...")
    try:
        delete_result = collection.delete_many({})
        print(f"🗑️  Deleted {delete_result.deleted_count} existing records")
    except Exception as e:
        print(f"⚠️  Could not clear collection: {e}")
    
 
    inserted_count = upload_in_batches(collection, records, UPLOAD_BATCH_SIZE)
    print(f"\n✅ Successfully uploaded {inserted_count}/{len(records)} records")
    
 
    try:
        actual_count = collection.count_documents({})
        print(f"✅ Verified {actual_count} records in database")
    except Exception as e:
        print(f"⚠️  Could not verify count: {e}")
    
 
    metadata = {
        "model_name": EMBEDDING_MODEL,
        "embedding_dimension": embedding_dim,
        "total_records": len(df),
        "uploaded_records": inserted_count,
        "database": DATABASE_NAME,
        "collection": COLLECTION_NAME,
        "sample_text": df['text'].iloc[0]
    }
    
    metadata_path = Path('./dataset/embedding_metadata.json')
    metadata_path.parent.mkdir(exist_ok=True)
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"\n💾 Metadata saved to '{metadata_path}'")
    
 
    create_vector_search_index()
    
 
    try:
        perform_sample_search(collection, model)
    except Exception as e:
        print(f"⚠️  Sample search skipped: {e}")
    
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("1. Create vector search index in MongoDB Atlas UI (see above)")
    print("2. Test with: perform_sample_search()")
    print("3. Integrate into your chatbot application")
    
    client.close()


if __name__ == "__main__":
    main()