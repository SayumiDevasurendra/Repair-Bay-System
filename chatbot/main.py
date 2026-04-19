from fastapi import FastAPI
from pydantic import BaseModel
import faiss
import pickle
import numpy as np
import requests
import os

app = FastAPI()

# 🔑 Hardcoded Gemini API Key (not recommended for production)
GEMINI_API_KEY = "AIzaSyApzSBzR5jn8xvQocZle5v8WOMGr2O18gA"

# Load FAISS index
if not os.path.exists("vector.index"):
    raise Exception("Run build_index.py first")

index = faiss.read_index("vector.index")

with open("documents.pkl", "rb") as f:
    documents = pickle.load(f)

# Simple embedding
def simple_embedding(text, dim=384):
    vec = np.zeros(dim)
    for word in text.lower().split():
        vec[hash(word) % dim] += 1
    return vec

# Request format
class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
def chat(req: ChatRequest):

    # Step 1: Convert question to embedding
    query_vec = simple_embedding(req.question)
    query_np = np.array([query_vec]).astype("float32")

    # Step 2: Search similar records
    distances, indices = index.search(query_np, k=5)
    relevant_docs = [documents[i] for i in indices[0]]

    context = "\n".join(relevant_docs)

    # Step 3: Prompt
    prompt = f"""
You are a vehicle maintenance assistant.

Answer ONLY using the dataset below.

Rules:
- Do NOT use outside knowledge
- If answer not found → say "I don't know"
- Keep answer short

DATA:
{context}

QUESTION:
{req.question}
"""

    # Step 4: Call Gemini API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"

    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }
    )

    result = response.json()

    # Step 5: Extract answer
    try:
        answer = result["candidates"][0]["content"]["parts"][0]["text"]
    except:
        answer = "Error: " + str(result)

    return {"answer": answer}