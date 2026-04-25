# Repair Bay System

## Frontend Dashboards

Start all four dashboard frontends from the repository root:

```powershell
npm run dev
```

This starts:

- NoiseGuard: `http://localhost:8080`
- LiftGuard: `http://localhost:8081`
- IOT Dashboard: `http://localhost:3000`
- Temperature: `http://localhost:8099`

The chatbot backend still runs separately:

```powershell
cd chatbot_v2
uvicorn app:app --reload --host 127.0.0.1 --port 8010
```
