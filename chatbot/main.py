import json
import os
from typing import Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="Repair Bay Safety Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_local_env() -> None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


load_local_env()


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "openrouter/auto",
)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
CHATBOT_PROVIDER = os.getenv("CHATBOT_PROVIDER", "openrouter").strip().lower()
REQUEST_TIMEOUT_SECONDS = 30


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    activePage: str | None = None
    dashboardContext: dict[str, Any] | None = None


def compact_json(data: Any) -> str:
    return json.dumps(data, indent=2, ensure_ascii=True, default=str)


def build_system_prompt() -> str:
    return (
        "You are a safety repair bay analytics assistant for a university assignment.\n"
        "You answer questions about gas, temperature, noise, and vehicle lift alignment dashboards.\n"
        "Use only the provided dashboard context.\n"
        "Do not invent sensor readings, dates, incidents, or root causes.\n"
        "If the context is insufficient, say that clearly.\n"
        "Keep answers concise and useful for operators, supervisors, and demo evaluators.\n"
        "When the context shows a warning or danger state, include a short recommended action.\n"
    )


def build_user_prompt(question: str, active_page: str | None, dashboard_context: dict[str, Any] | None) -> str:
    page = active_page or "unknown"
    context = dashboard_context or {}
    return (
        f"Active dashboard route: {page}\n\n"
        f"Dashboard context:\n{compact_json(context)}\n\n"
        f"User question:\n{question}\n\n"
        "Answer in plain language. Mention important values when available."
    )


def build_fallback_answer(question: str, active_page: str | None, dashboard_context: dict[str, Any] | None) -> str:
    context = dashboard_context or {}
    module_name = context.get("moduleName") or active_page or "this dashboard"
    status = context.get("status") or "UNKNOWN"
    headline = context.get("headline")
    metrics = context.get("metrics") or {}
    alerts = context.get("alerts") or []
    recommendations = context.get("recommendedActions") or []

    metric_parts = []
    for key, value in list(metrics.items())[:5]:
        metric_parts.append(f"{key}: {value}")

    answer_parts = [
        f"I could not reach an external LLM, so this is a local dashboard summary for {module_name}.",
        f"Current status: {status}.",
    ]

    if headline:
        answer_parts.append(str(headline))

    if metric_parts:
        answer_parts.append("Key metrics: " + "; ".join(metric_parts) + ".")

    if alerts:
        answer_parts.append("Recent alerts: " + "; ".join(str(alert) for alert in alerts[:3]) + ".")

    if recommendations:
        answer_parts.append("Suggested action: " + " ".join(str(item) for item in recommendations[:2]))
    else:
        answer_parts.append(
            "Suggested action: inspect the active module, verify thresholds, and review the latest chart trends."
        )

    answer_parts.append(f'Question received: "{question}"')
    return " ".join(answer_parts)


def find_metric(metrics: dict[str, Any], candidates: list[str]) -> tuple[str, Any] | tuple[None, None]:
    lowered = {key.lower(): (key, value) for key, value in metrics.items()}
    for candidate in candidates:
        match = lowered.get(candidate.lower())
        if match:
            return match
    return None, None


def normalize_datetime_tokens(text: str) -> set[str]:
    normalized = text.lower()
    replacements = {
        "/": "-",
        ".": ":",
        ",": " ",
        "t": " ",
    }
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)

    tokens = set(normalized.split())
    compact = normalized.replace(" ", "")
    if compact:
        tokens.add(compact)
    return {token for token in tokens if token}


def match_recent_record(question: str, recent_records: list[dict[str, Any]]) -> str | None:
    if not recent_records:
        return None

    question_tokens = normalize_datetime_tokens(question)
    for record in recent_records:
        date = str(record.get("date") or "")
        time = str(record.get("time") or "")
        avg_db = record.get("avg_db")
        status = str(record.get("status") or "UNKNOWN")

        record_tokens = normalize_datetime_tokens(f"{date} {time}")
        if question_tokens & record_tokens:
            return f"At {date} {time}, the recorded average noise level was {avg_db} dB with status {status}."

    return None


def answer_from_dashboard_context(question: str, active_page: str | None, dashboard_context: dict[str, Any] | None) -> str | None:
    context = dashboard_context or {}
    metrics = context.get("metrics") or {}
    recent_records = context.get("recentRecords") or []
    module_name = context.get("moduleName") or active_page or "this dashboard"
    status = str(context.get("status") or "UNKNOWN")
    headline = context.get("headline")
    alerts = context.get("alerts") or []
    recommendations = context.get("recommendedActions") or []
    question_lower = question.lower()

    if not metrics and not headline and not alerts:
        return None

    if "date" in question_lower or "time" in question_lower or any(char.isdigit() for char in question_lower):
        matched_record = match_recent_record(question, recent_records)
        if matched_record:
            return matched_record

    if "status" in question_lower or "safe" in question_lower or "danger" in question_lower or "warning" in question_lower:
        answer = f"The current status for {module_name} is {status}."
        if headline:
            answer += f" {headline}"
        if recommendations:
            answer += f" Recommended action: {recommendations[0]}"
        return answer

    direct_metric_map = [
        (["right distance", "right side distance"], ["rightDistanceCm", "rightDistance"]),
        (["left distance", "left side distance"], ["leftDistanceCm", "leftDistance"]),
        (["alignment difference", "alignment diff", "misalignment"], ["alignmentDiffCm", "alignmentDiff"]),
        (["tilt x"], ["tiltX"]),
        (["tilt y"], ["tiltY"]),
        (["safety score"], ["safetyScore"]),
        (["gas ppm", "current gas", "ppm"], ["currentPpm", "peakPpm", "averagePpm"]),
        (["min", "minimum", "lowest"], ["minTemperatureC"]),
        (["max", "maximum", "highest"], ["maxTemperatureC", "peakPpm"]),
        (["temperature", "current temperature"], ["currentTemperatureC", "averageTemperatureC", "maxTemperatureC"]),
        (["average"], ["averagePpm", "averageTemperatureC", "todayAverageAlignmentCm", "liveAverage"]),
        (["peak"], ["peakPpm", "maxTemperatureC"]),
        (["trend"], ["trend", "trendPercent"]),
        (["total readings", "all readings", "reading count"], ["totalReadings", "recentSamples"]),
    ]

    for phrases, metric_keys in direct_metric_map:
        if any(phrase in question_lower for phrase in phrases):
            metric_name, metric_value = find_metric(metrics, metric_keys)
            if metric_name is not None:
                return f"For {module_name}, {metric_name} is {metric_value}."

    if "alert" in question_lower:
        if alerts:
            return f"Recent alerts for {module_name}: " + "; ".join(str(alert) for alert in alerts[:3]) + "."
        return f"There are no recent alerts in the current {module_name} context."

    if "what should" in question_lower or "what action" in question_lower or "what do" in question_lower:
        if recommendations:
            return f"Recommended action for {module_name}: {recommendations[0]}"
        return f"For {module_name}, review the latest chart trends and verify the current sensor thresholds."

    return None


def call_openrouter(system_prompt: str, user_prompt: str) -> str:
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured.")

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["choices"][0]["message"]["content"].strip()


def call_gemini(system_prompt: str, user_prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    response = requests.post(
        (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        ),
        headers={"Content-Type": "application/json"},
        json={
            "systemInstruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 400,
            },
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["candidates"][0]["content"]["parts"][0]["text"].strip()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "provider": CHATBOT_PROVIDER}


@app.post("/chat")
def chat(req: ChatRequest) -> dict[str, Any]:
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(req.question, req.activePage, req.dashboardContext)
    local_context_answer = answer_from_dashboard_context(req.question, req.activePage, req.dashboardContext)

    if local_context_answer:
        return {
            "answer": local_context_answer,
            "source": "dashboard-context",
            "activePage": req.activePage,
        }

    try:
        if CHATBOT_PROVIDER == "gemini":
            answer = call_gemini(system_prompt, user_prompt)
        else:
            answer = call_openrouter(system_prompt, user_prompt)
        source = "llm"
    except Exception:
        answer = build_fallback_answer(req.question, req.activePage, req.dashboardContext)
        source = "local-fallback"

    return {
        "answer": answer,
        "source": source,
        "activePage": req.activePage,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("CHATBOT_HOST", "127.0.0.1"),
        port=int(os.getenv("CHATBOT_PORT", "4362")),
        reload=True,
    )
