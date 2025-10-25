 
import pandas as pd

 
csv_path = "./farmer_medicine_finder.csv"   
df = pd.read_csv(csv_path, header=None)

 
df.columns = [
    "medicine_name", "category", "form", "price", "availability", "manufacturer",
    "animal_type", "breed", "age", "gender", "weight", 
    "symptom1", "symptom2", "symptom3", "symptom4",
    "all_symptoms", "disease_name", "temperature", "score"
]

 
def clean_symptoms(row):
    symptoms = str(row['all_symptoms']).split(',')
    symptoms = list(dict.fromkeys([s.strip().lower() for s in symptoms]))
    return ', '.join(symptoms)

 
def row_to_vector_string(row):
    symptoms_cleaned = clean_symptoms(row)
    text = (
        f"Medicine: {row['medicine_name']} ({row['category']}, {row['form']}, "
        f"Price: {row['price']}, Availability: {row['availability']}, Manufacturer: {row['manufacturer']}). "
        f"Animal: {row['animal_type']} ({row['breed']}, Age: {row['age']}, Gender: {row['gender']}, Weight: {row['weight']}). "
        f"Symptoms: {symptoms_cleaned}. Disease: {row['disease_name']}. "
        f"Temperature: {row['temperature']}°C, Score: {row['score']}."
    )
    return text

 
df['vector_text'] = df.apply(row_to_vector_string, axis=1)

 
df[['vector_text']].to_csv("dataset/vector_text.csv", index=False)

 
print(df['vector_text'].head())
