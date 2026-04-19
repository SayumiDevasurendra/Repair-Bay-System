import pandas as pd
import pickle
import faiss
import numpy as np

def simple_embedding(text, dim=384):
    vec = np.zeros(dim)
    for word in text.lower().split():
        vec[hash(word) % dim] += 1
    return vec

df = pd.read_excel("data.xlsx")

documents = []

for _, row in df.iterrows():
    text = f"""
Vehicle Model: {row['Vehicle_Model']}
Mileage: {row['Mileage']}
Issues: {row['Reported_Issues']}
Fuel: {row['Fuel_Type']}
Tire: {row['Tire_Condition']}
Brake: {row['Brake_Condition']}
Battery: {row['Battery_Status']}
Maintenance Needed: {row['Need_Maintenance']}
"""
    documents.append(text)

embeddings = np.array([simple_embedding(d) for d in documents]).astype("float32")

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "vector.index")

with open("documents.pkl", "wb") as f:
    pickle.dump(documents, f)

print("✅ Index built successfully!")