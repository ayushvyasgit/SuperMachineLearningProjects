 

import pandas as pd
import numpy as np
from collections import defaultdict

 
disease_path = "./dataset/animalDiseaseDataset2.csv"
medicine_path = "./dataset/medicineDiseaseDataset.csv"
output_path = "./dataset/farmer_medicine_finder.csv"

 
print("🔄 Loading datasets...")
disease_df = pd.read_csv(disease_path)
medicine_df = pd.read_csv(medicine_path)

print(f"📂 Disease Dataset: {disease_df.shape}")
print(f"📂 Medicine Dataset: {medicine_df.shape}")

 
print("\n🧹 Cleaning Disease Dataset...")
disease_df.columns = disease_df.columns.str.strip()

 
if 'Body_Temperature' in disease_df.columns:
    disease_df['Body_Temperature'] = (
        disease_df['Body_Temperature']
        .astype(str)
        .str.replace('Â°C', '', regex=False)
        .str.replace('°C', '', regex=False)
        .str.strip()
    )
    disease_df['Body_Temperature'] = pd.to_numeric(disease_df['Body_Temperature'], errors='coerce')

 
if 'Heart_Rate' in disease_df.columns:
    disease_df['Heart_Rate'] = pd.to_numeric(disease_df['Heart_Rate'], errors='coerce')

 
text_cols = ['Animal_Type', 'Breed', 'Gender', 'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4', 'Disease_Prediction']
for col in text_cols:
    if col in disease_df.columns:
        disease_df[col] = disease_df[col].astype(str).str.strip().str.lower()

 
disease_df.replace(["no", "nan", "none", " ", "", "null"], np.nan, inplace=True)
disease_df.drop_duplicates(inplace=True)
disease_df.dropna(subset=['Disease_Prediction', 'Animal_Type'], inplace=True)
disease_df.reset_index(drop=True, inplace=True)

print(f"✅ Cleaned Disease Dataset: {disease_df.shape}")

 
print("🧹 Cleaning Medicine Dataset...")
medicine_df.columns = medicine_df.columns.str.strip()

 
for col in ['Name', 'Category', 'Dosage Form', 'Manufacturer', 'Indication', 'Classification']:
    if col in medicine_df.columns:
        medicine_df[col] = medicine_df[col].astype(str).str.strip().str.lower()

 
if 'Strength' in medicine_df.columns:
    medicine_df['Strength_mg'] = medicine_df['Strength'].str.extract(r'(\d+)').astype(float)

medicine_df.replace(["nan", "none", " ", "null", ""], np.nan, inplace=True)
medicine_df.dropna(subset=['Name', 'Indication'], inplace=True)
medicine_df.drop_duplicates(inplace=True)
medicine_df.reset_index(drop=True, inplace=True)

print(f"✅ Cleaned Medicine Dataset: {medicine_df.shape}")

 
print("\n🧠 Building Smart Mapping System...")

 
symptom_to_category = {
    'fever': ['antipyretic', 'antiviral', 'antibiotic'],
    'coughing': ['antibiotic', 'antiviral'],
    'vomiting': ['antibiotic', 'analgesic'],
    'diarrhea': ['antibiotic', 'antiseptic'],
    'lethargy': ['antipyretic', 'antibiotic', 'antiviral'],
    'appetite loss': ['antipyretic', 'antibiotic'],
    'skin lesions': ['antifungal', 'antiseptic', 'antibiotic'],
    'nasal discharge': ['antiviral', 'antibiotic'],
    'eye discharge': ['antibiotic', 'antiseptic'],
    'labored breathing': ['antibiotic', 'antiviral'],
    'lameness': ['analgesic', 'antibiotic'],
    'sneezing': ['antiviral', 'antibiotic'],
    'weight loss': ['antibiotic', 'antifungal'],
    'dehydration': ['antibiotic', 'antiseptic'],
    'swelling': ['analgesic', 'antibiotic'],
    'pain': ['analgesic', 'antipyretic'],
}

 
disease_to_treatment = {
 
    'parvovirus': ['antiviral', 'antipyretic', 'antibiotic'],
    'canine parvovirus': ['antiviral', 'antipyretic', 'antibiotic'],
    'upper respiratory infection': ['antiviral', 'antibiotic', 'antipyretic'],
    'feline herpesvirus': ['antiviral', 'antibiotic'],
    'feline calicivirus': ['antiviral', 'antibiotic'],
    'equine influenza': ['antiviral', 'antipyretic', 'antibiotic'],
    'canine distemper': ['antiviral', 'antibiotic', 'antipyretic'],
    'equine viral arteritis': ['antiviral', 'antibiotic'],
    'equine rhinopneumonitis': ['antiviral', 'antibiotic'],
    'feline viral rhinotracheitis': ['antiviral', 'antibiotic'],
    'bovine respiratory syncytial virus': ['antiviral', 'antibiotic'],
    'bovine leukemia virus': ['antiviral'],
    'respiratory syncytial virus': ['antiviral', 'antipyretic'],
    'canine flu': ['antiviral', 'antipyretic'],
    'bovine influenza': ['antiviral', 'antibiotic'],
    'feline leukemia': ['antiviral'],
    'bovine viral diarrhea': ['antiviral', 'antibiotic'],
    
 
    'foot and mouth disease': ['antibiotic', 'antipyretic', 'analgesic'],
    'gastroenteritis': ['antibiotic', 'antipyretic', 'antiseptic'],
    'lyme disease': ['antibiotic', 'analgesic'],
    'kennel cough': ['antibiotic', 'antipyretic'],
    'mastitis': ['antibiotic', 'analgesic'],
    'strangles': ['antibiotic', 'antipyretic'],
    'bovine respiratory disease': ['antibiotic', 'antipyretic'],
    'salmonellosis': ['antibiotic', 'antiseptic'],
    'bordetella infection': ['antibiotic'],
    'canine hepatitis': ['antibiotic', 'antipyretic'],
    'tuberculosis': ['antibiotic'],
    'bovine pneumonia': ['antibiotic', 'antipyretic'],
    'intestinal parasites': ['antibiotic', 'antiseptic'],
    'heartworm disease': ['antibiotic'],
    'cryptosporidiosis': ['antibiotic', 'antiseptic'],
    'bovine coccidiosis': ['antibiotic'],
    'coccidiosis': ['antibiotic'],
    'johne\'s disease': ['antibiotic'],
    
 
    'fungal infection': ['antifungal', 'antiseptic'],
    'ringworm': ['antifungal', 'antiseptic'],
    
 
    'panleukopenia': ['antiviral', 'antibiotic', 'antipyretic'],
    'feline panleukopenia': ['antiviral', 'antibiotic'],
    'tick-borne disease': ['antibiotic', 'antipyretic'],
    'feline infectious peritonitis': ['antiviral', 'antibiotic'],
    'conjunctivitis': ['antibiotic', 'antiseptic'],
    'equine piroplasmosis': ['antibiotic'],
    'chronic bronchitis': ['antibiotic', 'analgesic'],
    'feline upper respiratory infection': ['antiviral', 'antibiotic'],
    'equine arthritis': ['analgesic', 'antibiotic'],
    'arthritis': ['analgesic', 'antipyretic'],
    'equine infectious anemia': ['antibiotic', 'antipyretic'],
    'pancreatitis': ['analgesic', 'antibiotic'],
    'equine pneumonia': ['antibiotic', 'antipyretic'],
    'laminitis': ['analgesic', 'antibiotic'],
    'equine laminitis': ['analgesic', 'antibiotic'],
    'degenerative joint disease': ['analgesic'],
    'allergic rhinitis': ['antibiotic'],
    'equine leptospirosis': ['antibiotic'],
    'feline renal disease': ['antibiotic'],
    'hyperthyroidism': ['antidiabetic'],
    'equine encephalitis': ['antiviral', 'antibiotic'],
    'inflammatory bowel disease': ['antibiotic', 'analgesic'],
    'equine cushing\'s disease': ['antidiabetic'],
}

 
animal_types = ['dog', 'cat', 'cow', 'horse']

 
print("\n🔨 Building Comprehensive Mapping...")

mapping_records = []

for idx, disease_row in disease_df.iterrows():
    animal_type = disease_row['Animal_Type']
    disease = disease_row['Disease_Prediction']
    
 
    symptoms = []
    for i in range(1, 5):
        symptom_col = f'Symptom_{i}'
        if symptom_col in disease_row and pd.notna(disease_row[symptom_col]):
            symptoms.append(disease_row[symptom_col])
    
 
    medicine_categories = set()
    
 
    if disease in disease_to_treatment:
        medicine_categories.update(disease_to_treatment[disease])
    else:
        medicine_categories.add('antibiotic')   
    
 
    for symptom in symptoms:
        if symptom in symptom_to_category:
            medicine_categories.update(symptom_to_category[symptom])
    
 
    for category in medicine_categories:
        matching_medicines = medicine_df[medicine_df['Category'] == category]
        
        for _, med_row in matching_medicines.iterrows():
            record = {
 
                'Medicine_Name': med_row['Name'],
                'Medicine_Category': med_row['Category'],
                'Dosage_Form': med_row['Dosage Form'],
                'Strength_mg': med_row.get('Strength_mg', np.nan),
                'Classification': med_row['Classification'],
                'Manufacturer': med_row['Manufacturer'],
                
 
                'Animal_Type': animal_type,
                'Breed': disease_row.get('Breed', np.nan),
                'Age': disease_row.get('Age', np.nan),
                'Gender': disease_row.get('Gender', np.nan),
                'Weight': disease_row.get('Weight', np.nan),
                
 
                'Symptom_1': symptoms[0] if len(symptoms) > 0 else np.nan,
                'Symptom_2': symptoms[1] if len(symptoms) > 1 else np.nan,
                'Symptom_3': symptoms[2] if len(symptoms) > 2 else np.nan,
                'Symptom_4': symptoms[3] if len(symptoms) > 3 else np.nan,
                'All_Symptoms': ', '.join(symptoms) if symptoms else np.nan,
                
 
                'Disease': disease,
                
 
                'Body_Temperature': disease_row.get('Body_Temperature', np.nan),
                'Heart_Rate': disease_row.get('Heart_Rate', np.nan),
            }
            
            mapping_records.append(record)

 
final_df = pd.DataFrame(mapping_records)

 
final_df.drop_duplicates(subset=['Medicine_Name', 'Animal_Type', 'Disease', 'All_Symptoms'], inplace=True)
final_df.reset_index(drop=True, inplace=True)

 
final_df.sort_values(by=['Medicine_Name', 'Animal_Type', 'Disease'], inplace=True)

 
final_df.to_csv(output_path, index=False)

print(f"\n✅ FINAL DATASET CREATED: {final_df.shape}")
print(f"📁 Saved to: {output_path}")

 
print("\n" + "="*60)
print("📊 FARMER MEDICINE FINDER - STATISTICS")
print("="*60)

print(f"\n🔹 Total Medicine Recommendations: {len(final_df)}")
print(f"🔹 Unique Medicines Available: {final_df['Medicine_Name'].nunique()}")
print(f"🔹 Animal Types Covered: {final_df['Animal_Type'].nunique()}")
print(f"🔹 Diseases Covered: {final_df['Disease'].nunique()}")
print(f"🔹 Medicine Categories: {final_df['Medicine_Category'].nunique()}")

print("\n📈 Medicines per Animal Type:")
print(final_df.groupby('Animal_Type')['Medicine_Name'].nunique().sort_values(ascending=False))

print("\n📈 Top 10 Diseases with Most Medicine Options:")
disease_count = final_df.groupby('Disease')['Medicine_Name'].nunique().sort_values(ascending=False).head(10)
for disease, count in disease_count.items():
    print(f"  • {disease}: {count} medicines")

print("\n📈 Top Medicine Categories:")
print(final_df['Medicine_Category'].value_counts().head())

print("\n🔍 SAMPLE FARMER QUERIES:")
print("\n1️⃣ Dog with Fever and Vomiting:")
sample1 = final_df[(final_df['Animal_Type'] == 'dog') & 
                   (final_df['All_Symptoms'].str.contains('fever|vomiting', na=False))]
print(f"   Found {len(sample1)} medicine options")
print(sample1[['Medicine_Name', 'Medicine_Category', 'Disease', 'All_Symptoms']].head(3))

print("\n2️⃣ Cat with Upper Respiratory Infection:")
sample2 = final_df[(final_df['Animal_Type'] == 'cat') & 
                   (final_df['Disease'].str.contains('respiratory', na=False))]
print(f"   Found {len(sample2)} medicine options")
print(sample2[['Medicine_Name', 'Medicine_Category', 'Disease', 'All_Symptoms']].head(3))

print("\n3️⃣ Cow with Mastitis:")
sample3 = final_df[(final_df['Animal_Type'] == 'cow') & 
                   (final_df['Disease'] == 'mastitis')]
print(f"   Found {len(sample3)} medicine options")
print(sample3[['Medicine_Name', 'Medicine_Category', 'Dosage_Form', 'Classification']].head(3))

print("\n" + "="*60)
print("✅ FARMER CAN NOW SEARCH BY:")
print("   • Animal Type (dog, cat, cow, horse)")
print("   • Symptoms (fever, coughing, vomiting, etc.)")
print("   • Disease Name (parvovirus, mastitis, etc.)")
print("   • Medicine Category (antibiotic, antiviral, etc.)")
print("="*60)