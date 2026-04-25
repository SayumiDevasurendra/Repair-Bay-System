# Safety Monitoring Chatbot v2

Backend API for the in-dashboard safety chatbot. It reads `safety_monitoring_dataset.xlsx`, retrieves matching dataset rows, and uses Gemini only to phrase an answer from that evidence.

## Run

```powershell
cd chatbot_v2
python -m pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8010
```

This starts only the API on `http://127.0.0.1:8010`.

The visible chatbot popup is mounted inside `IT22114358/IOT_Dashboard`, so open the safety dashboard UI and use the floating assistant there.

## API

- `POST /chat` with `{ "question": "..." }`
- `GET /stats`
- `GET /health`

The Gemini key is read from `chatbot_v2/.env`, which is ignored by git.
