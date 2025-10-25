# """
# STEP 3: Query Search with Similarity
# =====================================
# This script:
# 1. Takes a farmer's question
# 2. Converts it to an embedding
# 3. Finds similar records using cosine similarity
# 4. Returns the best matching medicine recommendations

# Prerequisites:
# pip install sentence-transformers pymongo numpy scikit-learn
# """

# import numpy as np
# from sentence_transformers import SentenceTransformer
# from pymongo import MongoClient
# from sklearn.metrics.pairwise import cosine_similarity
# import json

 
 
 

 
# MONGO_URI = "mongodb://localhost:27017/"
# DATABASE_NAME = "livestock_ai_db"
# COLLECTION_NAME = "medicine_records"

 
# with open('./dataset/embedding_metadata.json', 'r') as f:
#     metadata = json.load(f)

# EMBEDDING_MODEL = metadata['model_name']

 
 
 

# print("=" * 70)
# print("🔍 LIVESTOCK AI - STEP 3: SIMILARITY SEARCH")
# print("=" * 70)

# print("\n🧠 Loading embedding model...")
# model = SentenceTransformer(EMBEDDING_MODEL)
# print(f"✅ Model loaded: {EMBEDDING_MODEL}")

# print("\n🗄️  Connecting to MongoDB...")
# client = MongoClient(MONGO_URI)
# db = client[DATABASE_NAME]
# collection = db[COLLECTION_NAME]

# total_records = collection.count_documents({})
# print(f"✅ Connected! Found {total_records} records")

 
 
 

# def search_medicine(query, top_k=5, animal_filter=None, min_similarity=0.3):
#     """
#     Search for medicine recommendations based on query.
    
#     Args:
#         query: User's question (e.g., "My cow has fever and coughing")
#         top_k: Number of results to return
#         animal_filter: Filter by animal type (e.g., "cow", "dog")
#         min_similarity: Minimum similarity threshold (0-1)
    
#     Returns:
#         List of matching records with similarity scores
#     """
    
#     print(f"\n🔍 Searching for: '{query}'")
    
 
#     query_embedding = model.encode(query)
#     query_vector = query_embedding.reshape(1, -1)
    
 
#     filter_query = {}
#     if animal_filter:
#         filter_query['Animal_Type'] = animal_filter.lower()
    
#     cursor = collection.find(filter_query, {
#         'context': 1,
#         'embedding': 1,
#         'Medicine_Name': 1,
#         'Medicine_Category': 1,
#         'Dosage_Form': 1,
#         'Classification': 1,
#         'Animal_Type': 1,
#         'Disease': 1,
#         'All_Symptoms': 1,
#         'Strength_mg': 1,
#         'Manufacturer': 1,
#         '_id': 0
#     })
    
#     records = list(cursor)
    
#     if len(records) == 0:
#         print("❌ No records found!")
#         return []
    
#     print(f"📊 Searching through {len(records)} records...")
    
 
#     embeddings = np.array([r['embedding'] for r in records])
#     similarities = cosine_similarity(query_vector, embeddings)[0]
    
 
#     for i, record in enumerate(records):
#         record['similarity_score'] = float(similarities[i])
 
#         del record['embedding']
    
 
#     filtered_records = [r for r in records if r['similarity_score'] >= min_similarity]
#     filtered_records.sort(key=lambda x: x['similarity_score'], reverse=True)
    
 
#     seen_medicines = set()
#     unique_results = []
    
#     for record in filtered_records:
#         medicine_key = (record['Medicine_Name'], record['Animal_Type'], record['Disease'])
#         if medicine_key not in seen_medicines:
#             seen_medicines.add(medicine_key)
#             unique_results.append(record)
#             if len(unique_results) >= top_k:
#                 break
    
#     return unique_results

 
 
 

# def display_results(results):
#     """Pretty print search results"""
    
#     if not results:
#         print("\n❌ No matching results found!")
#         print("💡 Try:")
#         print("   - Using different keywords")
#         print("   - Lowering the similarity threshold")
#         print("   - Being more specific about symptoms")
#         return
    
#     print(f"\n✅ Found {len(results)} recommendations:")
#     print("=" * 70)
    
#     for i, result in enumerate(results, 1):
#         print(f"\n🏥 RECOMMENDATION  
#         print("-" * 70)
#         print(f"💊 Medicine: {result['Medicine_Name'].upper()}")
#         print(f"   Category: {result['Medicine_Category']}")
#         print(f"   Form: {result['Dosage_Form']}")
#         if result.get('Strength_mg'):
#             print(f"   Strength: {result['Strength_mg']} mg")
#         print(f"   Type: {result['Classification']}")
#         print(f"   Manufacturer: {result.get('Manufacturer', 'N/A')}")
#         print(f"\n🐄 For Animal: {result['Animal_Type'].upper()}")
#         print(f"🦠 Disease: {result['Disease']}")
#         if result.get('All_Symptoms'):
#             print(f"🩺 Symptoms: {result['All_Symptoms']}")
#         print("-" * 70)

 
 
 

# print("\n" + "=" * 70)
# print("🧪 RUNNING TEST QUERIES")
# print("=" * 70)

 
# print("\n" + "🔹" * 35)
# results = search_medicine(
#     query="My cow has fever and is not eating",
#     top_k=3,
#     animal_filter="cow"
# )
# display_results(results)

 
# print("\n" + "🔹" * 35)
# results = search_medicine(
#     query="Dog with parvovirus",
#     top_k=3,
#     animal_filter="dog"
# )
# display_results(results)

 
# print("\n" + "🔹" * 35)
# results = search_medicine(
#     query="Cat sneezing with eye discharge",
#     top_k=3,
#     animal_filter="cat"
# )
# display_results(results)

 
# print("\n" + "🔹" * 35)
# results = search_medicine(
#     query="Horse cannot walk properly, swollen joints",
#     top_k=3,
#     animal_filter="horse"
# )
# display_results(results)

 
 
 

# def interactive_search():
#     """Interactive mode for testing queries"""
    
#     print("\n" + "=" * 70)
#     print("🎮 INTERACTIVE SEARCH MODE")
#     print("=" * 70)
#     print("\n💡 Tips:")
#     print("   - Be specific: 'My cow has fever and coughing'")
#     print("   - Mention symptoms: 'Dog vomiting and diarrhea'")
#     print("   - Name the disease: 'Cat with upper respiratory infection'")
#     print("   - Type 'quit' to exit")
#     print("\n" + "=" * 70)
    
#     while True:
#         print("\n")
#         query = input("🔍 Enter your question: ").strip()
        
#         if query.lower() in ['quit', 'exit', 'q']:
#             print("\n👋 Goodbye!")
#             break
        
#         if not query:
#             continue
        
 
#         animal = input("🐄 Filter by animal? (dog/cat/cow/horse or press Enter for all): ").strip().lower()
#         animal_filter = animal if animal in ['dog', 'cat', 'cow', 'horse'] else None
        
 
#         results = search_medicine(
#             query=query,
#             top_k=5,
#             animal_filter=animal_filter,
#             min_similarity=0.2
#         )
        
#         display_results(results)

 
 
 

# if __name__ == "__main__":
#     print("\n" + "=" * 70)
#     print("✅ STEP 3 COMPLETE - Search System Ready!")
#     print("=" * 70)
    
 
 
    
#     print("\n📌 Next Steps:")
#     print("   1. Uncomment 'interactive_search()' above to test manually")
#     print("   2. Run 'step4_gemini_integration.py' to add AI-powered responses")
#     print("   3. Build a web interface (Streamlit/React)")
#     print("=" * 70)