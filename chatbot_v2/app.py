from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "safety_monitoring_dataset.xlsx"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
CHATBOT_VERSION = "2.3-openrouter-evidence"

DOMAINS = {
    "temperature": {
        "columns": ["Temperature_C", "Fire_Risk_Level"],
        "keywords": ["temperature", "temp", "heat", "hot", "cold", "fire", "thermal"],
    },
    "gas": {
        "columns": ["Gas_Level_ppm", "Gas_Leak_Status"],
        "keywords": ["gas", "ppm", "leak", "smoke", "fume", "vapor"],
    },
    "noise": {
        "columns": ["Noise_dB", "Noise_Risk"],
        "keywords": ["noise", "sound", "db", "decibel", "loud"],
    },
    "lifting": {
        "columns": ["Lift_Alignment", "Lift_Status"],
        "keywords": ["lift", "lifting", "alignment", "vehicle", "hoist", "tilt"],
    },
}

STATUS_COLUMNS = {
    "temperature": {
        "column": "Fire_Risk_Level",
        "label": "fire risk",
        "values": ["Low", "Medium", "High"],
    },
    "gas": {
        "column": "Gas_Leak_Status",
        "label": "gas leak status",
        "values": ["Safe", "Warning", "Critical"],
    },
    "noise": {
        "column": "Noise_Risk",
        "label": "noise risk",
        "values": ["Safe", "Risky", "Dangerous"],
    },
    "lifting": {
        "column": "Lift_Status",
        "label": "lift status",
        "values": ["Normal", "Critical"],
    },
    "overall": {
        "column": "Overall_Safety_Status",
        "label": "overall safety status",
        "values": ["Safe", "Alert", "Emergency"],
    },
}


def load_dotenv() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass(frozen=True)
class RetrievedRow:
    score: float
    data: dict[str, Any]


class ChatRequest(BaseModel):
    question: str
    activePage: str = ""


class SafetyKnowledgeBase:
    def __init__(self, dataset_path: Path) -> None:
        if not dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        self.df = pd.read_excel(dataset_path)
        self.df["Timestamp"] = pd.to_datetime(self.df["Timestamp"], errors="coerce")
        self.records = self.df.fillna("").to_dict(orient="records")
        self.documents = [self._row_to_document(row) for row in self.records]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.matrix = self.vectorizer.fit_transform(self.documents)

    def _row_to_document(self, row: dict[str, Any]) -> str:
        return (
            f"timestamp {row.get('Timestamp')} "
            f"gas level {row.get('Gas_Level_ppm')} ppm gas leak status {row.get('Gas_Leak_Status')} "
            f"temperature {row.get('Temperature_C')} c fire risk {row.get('Fire_Risk_Level')} "
            f"noise {row.get('Noise_dB')} db noise risk {row.get('Noise_Risk')} "
            f"lift alignment {row.get('Lift_Alignment')} lift status {row.get('Lift_Status')} "
            f"overall safety status {row.get('Overall_Safety_Status')}"
        ).lower()

    def detect_domains(self, question: str, active_page: str = "") -> list[str]:
        lowered_question = question.lower()
        generic_words = [
            "overall",
            "hazard",
            "hazards",
            "safety condition",
            "safety report",
            "repair bay",
            "dataset",
            "main safety",
            "most important",
            "compare",
        ]
        if any(word in lowered_question for word in generic_words):
            return list(DOMAINS)

        found = [
            name
            for name, config in DOMAINS.items()
            if any(keyword in lowered_question for keyword in config["keywords"])
        ]
        if found:
            return found

        lowered_page = active_page.lower()
        page_domains = [
            name
            for name, config in DOMAINS.items()
            if any(keyword in lowered_page for keyword in config["keywords"])
        ]
        return page_domains or list(DOMAINS)

    def retrieve(self, question: str, limit: int = 8) -> list[RetrievedRow]:
        query = self._expand_query(question)
        scores = cosine_similarity(self.vectorizer.transform([query]), self.matrix).flatten()
        ranked = scores.argsort()[::-1][:limit]
        return [RetrievedRow(float(scores[index]), self._clean_row(self.records[index])) for index in ranked]

    def summary(self, domains: list[str]) -> dict[str, Any]:
        summary: dict[str, Any] = {
            "row_count": int(len(self.df)),
            "time_range": {
                "from": self.df["Timestamp"].min().strftime("%Y-%m-%d %H:%M:%S"),
                "to": self.df["Timestamp"].max().strftime("%Y-%m-%d %H:%M:%S"),
            },
            "overall_safety_status": self._counts("Overall_Safety_Status"),
        }

        if "gas" in domains:
            summary["gas"] = self._numeric_and_counts("Gas_Level_ppm", "Gas_Leak_Status", "ppm")
        if "temperature" in domains:
            summary["temperature"] = self._numeric_and_counts("Temperature_C", "Fire_Risk_Level", "C")
        if "noise" in domains:
            summary["noise"] = self._numeric_and_counts("Noise_dB", "Noise_Risk", "dB")
        if "lifting" in domains:
            summary["lifting"] = self._numeric_and_counts("Lift_Alignment", "Lift_Status", "alignment units")

        return summary

    def deterministic_answer(self, question: str, domains: list[str], rows: list[RetrievedRow]) -> str:
        direct_answer = self.direct_answer(question, domains)
        if direct_answer:
            return direct_answer

        explanation = self.explanation_answer(question, domains)
        if explanation:
            return explanation

        summary = self.summary(domains)
        lines = [
            f"I checked {summary['row_count']} dataset rows from {summary['time_range']['from']} to {summary['time_range']['to']}.",
        ]

        for domain in domains:
            stats = summary.get(domain)
            if not stats:
                continue
            highest = stats["highest_record"]
            lowest = stats["lowest_record"]
            lines.append(
                f"{domain.title()}: min {stats['min']} {stats['unit']}, max {stats['max']} {stats['unit']}, "
                f"average {stats['average']} {stats['unit']}; status counts {stats['counts']}."
            )
            lines.append(
                f"Highest {domain} record: {highest['Timestamp']} with {self._domain_reading(domain, highest)}; "
                f"overall status {highest['Overall_Safety_Status']}."
            )
            if "lowest" in question.lower() or "minimum" in question.lower() or "min " in question.lower():
                lines.append(
                    f"Lowest {domain} record: {lowest['Timestamp']} with {self._domain_reading(domain, lowest)}; "
                    f"overall status {lowest['Overall_Safety_Status']}."
                )

        if rows:
            lines.append("Closest matching records:")
            for item in rows[:3]:
                row = item.data
                lines.append(
                    f"- {row['Timestamp']}: gas {row['Gas_Level_ppm']} ppm ({row['Gas_Leak_Status']}), "
                    f"temperature {row['Temperature_C']} C ({row['Fire_Risk_Level']}), "
                    f"noise {row['Noise_dB']} dB ({row['Noise_Risk']}), "
                    f"lift alignment {row['Lift_Alignment']} ({row['Lift_Status']}), "
                    f"overall {row['Overall_Safety_Status']}."
                )

        if "recommend" in question.lower() or "what should" in question.lower() or "action" in question.lower():
            lines.append(
                "Recommended action: prioritize Emergency/Critical rows, ventilate and isolate gas warnings, cool high-temperature areas, reduce exposure to dangerous noise, and stop lift use when lift status is Critical."
            )

        return "\n".join(lines)

    def explanation_answer(self, question: str, domains: list[str]) -> str | None:
        lowered = question.lower()
        explanation_words = [
            "explain",
            "why",
            "hazard",
            "hazards",
            "safe overall",
            "safety condition",
            "safety report",
            "most important",
            "what should",
            "recommend",
            "actions",
            "compare",
            "risky",
            "problem",
            "problems",
        ]
        if not any(word in lowered for word in explanation_words):
            return None

        insights = self.safety_insights(domains)

        if "noise" in domains and "lifting" in domains and "safe" in lowered:
            noise = insights["domains"]["noise"]
            lift = insights["domains"]["lifting"]
            return (
                "No, the noise and lift conditions are not safe overall.\n"
                f"Noise has {noise['unsafe_count']} unsafe records "
                f"({noise['unsafe_percent']}%): {noise['risk_breakdown']}.\n"
                f"Lifting has {lift['unsafe_count']} Critical records "
                f"({lift['unsafe_percent']}%).\n"
                "Because both areas show many unsafe readings, technicians should reduce noise exposure and inspect lift alignment before continuing high-risk work."
            )

        ranked = [
            (domain, info)
            for domain, info in insights["domains"].items()
            if domain in domains
        ]
        ranked.sort(key=lambda item: item[1]["unsafe_count"], reverse=True)

        lines = ["The most important hazards shown in the dataset are:"]
        for index, (domain, info) in enumerate(ranked[:4], start=1):
            lines.append(
                f"{index}. {info['hazard_name']}: {info['unsafe_count']} unsafe records "
                f"({info['unsafe_percent']}%). {info['risk_breakdown']}."
            )

        overall = insights["overall"]
        lines.append(
            f"Overall safety is heavily weighted toward Emergency records: "
            f"{overall.get('Emergency', 0)} Emergency, {overall.get('Alert', 0)} Alert, and {overall.get('Safe', 0)} Safe."
        )
        lines.append(
            "Priority actions: handle gas warnings/critical leaks first, reduce high fire-risk temperature conditions, control dangerous noise exposure, and stop lift use when lift status is Critical."
        )
        return "\n".join(lines)

    def safety_insights(self, domains: list[str]) -> dict[str, Any]:
        insights: dict[str, Any] = {
            "rows": int(len(self.df)),
            "overall": self._counts("Overall_Safety_Status"),
            "domains": {},
        }

        if "gas" in domains:
            counts = self._counts("Gas_Leak_Status")
            unsafe = counts.get("Warning", 0) + counts.get("Critical", 0)
            insights["domains"]["gas"] = {
                "hazard_name": "Gas leak risk",
                "unsafe_count": unsafe,
                "unsafe_percent": self._percent(unsafe),
                "risk_breakdown": f"{counts.get('Critical', 0)} Critical, {counts.get('Warning', 0)} Warning, {counts.get('Safe', 0)} Safe",
            }
        if "temperature" in domains:
            counts = self._counts("Fire_Risk_Level")
            unsafe = counts.get("High", 0) + counts.get("Medium", 0)
            insights["domains"]["temperature"] = {
                "hazard_name": "Temperature/fire risk",
                "unsafe_count": unsafe,
                "unsafe_percent": self._percent(unsafe),
                "risk_breakdown": f"{counts.get('High', 0)} High, {counts.get('Medium', 0)} Medium, {counts.get('Low', 0)} Low",
            }
        if "noise" in domains:
            counts = self._counts("Noise_Risk")
            unsafe = counts.get("Dangerous", 0) + counts.get("Risky", 0)
            insights["domains"]["noise"] = {
                "hazard_name": "Noise exposure",
                "unsafe_count": unsafe,
                "unsafe_percent": self._percent(unsafe),
                "risk_breakdown": f"{counts.get('Dangerous', 0)} Dangerous, {counts.get('Risky', 0)} Risky, {counts.get('Safe', 0)} Safe",
            }
        if "lifting" in domains:
            counts = self._counts("Lift_Status")
            unsafe = counts.get("Critical", 0)
            insights["domains"]["lifting"] = {
                "hazard_name": "Lift alignment risk",
                "unsafe_count": unsafe,
                "unsafe_percent": self._percent(unsafe),
                "risk_breakdown": f"{counts.get('Critical', 0)} Critical, {counts.get('Normal', 0)} Normal",
            }

        return insights

    def direct_answer(self, question: str, domains: list[str]) -> str | None:
        lowered = question.lower()

        count_words = ["how many", "count", "number of", "total"]
        if any(word in lowered for word in count_words):
            return self._count_answer(lowered, domains)

        if any(word in lowered for word in ["highest", "maximum", "max"]):
            return self._extreme_answer(lowered, domains, highest=True)

        if any(word in lowered for word in ["lowest", "minimum", "min"]):
            return self._extreme_answer(lowered, domains, highest=False)

        return None

    def _count_answer(self, lowered_question: str, domains: list[str]) -> str | None:
        targets = self._status_targets(lowered_question, domains)
        if not targets:
            return None

        lines = []
        for target in targets:
            count = int((self.df[target["column"]].astype(str).str.lower() == target["value"].lower()).sum())
            lines.append(
                f"There are {count} {target['value']} {target['label']} records in the dataset."
            )

        return "\n".join(lines)

    def _status_targets(self, lowered_question: str, domains: list[str]) -> list[dict[str, str]]:
        selected_keys = list(domains)
        if "overall" in lowered_question or "safety status" in lowered_question or "emergency" in lowered_question:
            selected_keys.append("overall")

        if "fire" in lowered_question or "temperature" in lowered_question:
            selected_keys = ["temperature" if key == "overall" else key for key in selected_keys]

        targets = []
        seen = set()
        for key in selected_keys:
            config = STATUS_COLUMNS.get(key)
            if not config:
                continue
            for value in config["values"]:
                signature = (config["column"], value)
                if value.lower() in lowered_question and signature not in seen:
                    targets.append({
                        "column": config["column"],
                        "label": config["label"],
                        "value": value,
                    })
                    seen.add(signature)
        return targets

    def _extreme_answer(self, lowered_question: str, domains: list[str], highest: bool) -> str | None:
        domain = self._primary_numeric_domain(lowered_question, domains)
        if not domain:
            return None

        value_col = {
            "temperature": "Temperature_C",
            "gas": "Gas_Level_ppm",
            "noise": "Noise_dB",
            "lifting": "Lift_Alignment",
        }[domain]
        series = pd.to_numeric(self.df[value_col], errors="coerce")
        index = series.idxmax() if highest else series.idxmin()
        row = self._clean_row(self.df.loc[index].to_dict())
        word = "highest" if highest else "lowest"
        return (
            f"The {word} {domain} record is {self._domain_reading(domain, row)} at {row['Timestamp']}.\n"
            f"Overall safety status: {row['Overall_Safety_Status']}."
        )

    def _primary_numeric_domain(self, lowered_question: str, domains: list[str]) -> str | None:
        for domain in ["temperature", "gas", "noise", "lifting"]:
            if domain in domains and any(keyword in lowered_question for keyword in DOMAINS[domain]["keywords"]):
                return domain
        return domains[0] if len(domains) == 1 and domains[0] in DOMAINS else None

    def _domain_reading(self, domain: str, row: dict[str, Any]) -> str:
        if domain == "gas":
            return f"gas {row['Gas_Level_ppm']} ppm ({row['Gas_Leak_Status']})"
        if domain == "temperature":
            return f"temperature {row['Temperature_C']} C ({row['Fire_Risk_Level']})"
        if domain == "noise":
            return f"noise {row['Noise_dB']} dB ({row['Noise_Risk']})"
        if domain == "lifting":
            return f"lift alignment {row['Lift_Alignment']} ({row['Lift_Status']})"
        return str(row)

    def _expand_query(self, question: str) -> str:
        tokens = [question]
        for domain in self.detect_domains(question):
            tokens.extend(DOMAINS[domain]["columns"])
            tokens.extend(DOMAINS[domain]["keywords"])

        for number in re.findall(r"\d+(?:\.\d+)?", question):
            tokens.extend([f"value {number}", f"reading {number}"])

        return " ".join(tokens).lower()

    def _numeric_and_counts(self, value_col: str, status_col: str, unit: str) -> dict[str, Any]:
        series = pd.to_numeric(self.df[value_col], errors="coerce")
        return {
            "unit": unit,
            "min": self._round(series.min()),
            "max": self._round(series.max()),
            "average": self._round(series.mean()),
            "counts": self._counts(status_col),
            "highest_record": self._clean_row(self.df.loc[series.idxmax()].to_dict()),
            "lowest_record": self._clean_row(self.df.loc[series.idxmin()].to_dict()),
        }

    def _counts(self, column: str) -> dict[str, int]:
        return {str(k): int(v) for k, v in self.df[column].value_counts(dropna=False).to_dict().items()}

    def _clean_row(self, row: dict[str, Any]) -> dict[str, Any]:
        cleaned: dict[str, Any] = {}
        for key, value in row.items():
            if isinstance(value, pd.Timestamp):
                cleaned[key] = value.strftime("%Y-%m-%d %H:%M:%S")
            elif pd.isna(value):
                cleaned[key] = None
            elif hasattr(value, "item"):
                cleaned[key] = value.item()
            else:
                cleaned[key] = value
        return cleaned

    def _round(self, value: Any) -> float:
        return round(float(value), 2)

    def _percent(self, count: int) -> float:
        return round((count / len(self.df)) * 100, 1)


def ask_ai(question: str, evidence: dict[str, Any]) -> tuple[str | None, dict[str, Any]]:
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    models = [
        item.strip()
        for item in os.getenv("OPENROUTER_MODELS", os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")).split(",")
        if item.strip()
    ]
    if not api_key:
        return None, {"ok": False, "provider": "openrouter", "error": "Missing OPENROUTER_API_KEY."}

    system_prompt = (
        "You are a repair-bay safety monitoring chatbot. "
        "Use only the provided dataset evidence. "
        "Do not invent values. Do not mention pandas, JSON, APIs, or tokens. "
        "Do not list matching records unless the user asks for records. "
        "Answer naturally with exact counts, percentages, risk labels, and practical safety actions."
    )
    user_prompt = (
        f"Question: {question}\n\n"
        f"Dataset evidence from pandas:\n{json.dumps(evidence, indent=2)}"
    )

    last_error = None
    for model in models:
        try:
            session = requests.Session()
            session.trust_env = False
            response = session.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://127.0.0.1:5173",
                    "X-Title": "Repair Bay Safety Chatbot",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.1,
                    "top_p": 0.7,
                    "max_tokens": 900,
                    "reasoning": {"enabled": False},
                },
                timeout=20,
            )
            if not response.ok:
                last_error = f"{response.status_code}: {response.text[:700]}"
                continue
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            if isinstance(content, list):
                content = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in content)
            if not content or not str(content).strip():
                last_error = f"Empty response from {model}: {json.dumps(data)[:700]}"
                continue
            return str(content).strip(), {
                "ok": True,
                "provider": "openrouter",
                "model": data.get("model", model),
            }
        except Exception as exc:
            last_error = str(exc)

    return None, {"ok": False, "provider": "openrouter", "modelsTried": models, "error": last_error}


load_dotenv()
knowledge_base = SafetyKnowledgeBase(DATASET_PATH)
app = FastAPI(title="Repair Bay Safety Chatbot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "ok": True,
        "version": CHATBOT_VERSION,
        "rows": len(knowledge_base.df),
        "dataset": DATASET_PATH.name,
    }


@app.post("/chat")
def chat(payload: ChatRequest):
    question = payload.question.strip()
    active_page = payload.activePage.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    domains = knowledge_base.detect_domains(question, active_page)
    rows = knowledge_base.retrieve(question)
    evidence = {
        "domains": domains,
        "summary": knowledge_base.summary(domains),
        "insights": knowledge_base.safety_insights(domains),
        "matching_records": [{"score": item.score, "row": item.data} for item in rows],
    }

    direct_answer = knowledge_base.direct_answer(question, domains)
    if direct_answer:
        return {
            "answer": direct_answer,
            "answerType": "direct_dataset",
            "version": CHATBOT_VERSION,
            "domains": domains,
            "evidence": evidence,
        }

    ai_answer, ai_status = ask_ai(question, evidence)
    if ai_answer:
        return {
            "answer": ai_answer,
            "answerType": "ai_grounded",
            "version": CHATBOT_VERSION,
            "ai": ai_status,
            "domains": domains,
            "evidence": evidence,
        }

    return {
        "answer": knowledge_base.deterministic_answer(question, domains, rows),
        "answerType": "dataset_explanation",
        "version": CHATBOT_VERSION,
        "ai": ai_status,
        "domains": domains,
        "evidence": evidence,
    }


@app.get("/stats")
def stats(domains: str = Query(default="")):
    selected = [item.strip() for item in domains.split(",") if item.strip()] or list(DOMAINS)
    return knowledge_base.summary(selected)
