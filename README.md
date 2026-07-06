# AI Kubernetes Troubleshooting Agent

On-demand Kubernetes troubleshooting powered by AI, with a minimal dashboard for investigation, diagnosis, and history.

## Architecture

```text
Frontend (Next.js + InsForge Auth)
    ↓
FastAPI Backend (Orchestrator)
    ↓
Kubernetes Investigation Layer
    ↓
AI Kubernetes Agent (OpenRouter)
    ↓
Diagnosis + History (InsForge)
```

## Features

- InsForge authentication (sign up / sign in)
- Protected dashboard
- One-click cluster investigation
- Realtime progress via InsForge WebSockets
- AI root cause analysis and fix recommendations
- Investigation history stored in InsForge PostgreSQL

## Quick Start

### 1. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend (`backend/.env`):**

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key from InsForge |
| `OPENROUTER_MODEL` | LLM model (default: `openai/gpt-4o-mini`) |
| `KUBECONFIG_PATH` | Optional path to kubeconfig |
| `INSFORGE_BASE_URL` | InsForge backend URL |
| `INSFORGE_ANON_KEY` | InsForge anon key (for realtime progress) |

**Frontend (`frontend/.env`):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_INSFORGE_BASE_URL` | InsForge backend URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key |

### 2. Set up InsForge database

Run the SQL in `docs/insforge-setup.sql` in your InsForge SQL editor. This creates:

- `investigations` table with RLS policies
- `investigation:%` realtime channel
- `publish_investigation_progress` RPC function

### 3. Run with Docker

```bash
docker compose up --build
```

### 4. Use the app

1. Open http://localhost:3000
2. Sign up or sign in
3. Click **Investigate Cluster**
4. Watch realtime progress and review the diagnosis
5. View past investigations in the history table

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| POST | `/investigate` | Run investigation + AI diagnosis |

Optional request body:

```json
{
  "investigation_id": "uuid-for-realtime-progress"
}
```

## Project Structure

```text
backend/
  kubernetes/     # Investigation layer (kubectl)
  ai/             # LLM reasoning (OpenRouter)
  services/       # Orchestration + realtime publisher
frontend/
  src/app/        # Pages (dashboard, sign-in)
  src/components/ # Dashboard UI
  src/hooks/      # Investigation + history hooks
  src/services/   # API + InsForge data access
docs/
  insforge-setup.sql
```
