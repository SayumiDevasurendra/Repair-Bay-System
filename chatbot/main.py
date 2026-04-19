from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import faiss
import pickle
import numpy as np
import requests
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 Your OpenRouter API key
OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY",
    "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",
)

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

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
def chat(req: ChatRequest):

    # 🔍 Step 1: Search dataset
    query_vec = simple_embedding(req.question)
    query_np = np.array([query_vec]).astype("float32")

    distances, indices = index.search(query_np, k=5)
    relevant_docs = [documents[i] for i in indices[0]]

    context = "\n".join(relevant_docs)

    # 🎯 Step 2: Prompt
    prompt = f"""
You are a vehicle maintenance assistant.

Answer ONLY using the dataset below.

Rules:
- Do NOT use outside knowledge
- If answer not found → say "I don't know"
- Keep answer simple

DATA:
{context}

QUESTION:
{req.question}
"""

    # 🔥 Step 3: OpenRouter API (Python)
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "nvidia/nemotron-3-super-120b-a12b:free",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    result = response.json()

    # 🧠 Step 4: Extract answer
    try:
        answer = result["choices"][0]["message"]["content"]
    except:
        answer = "Error: " + str(result)

    return {"answer": answer}