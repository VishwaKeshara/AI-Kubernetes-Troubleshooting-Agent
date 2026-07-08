# AI Kubernetes Troubleshooting Agent

This is an on-demand troubleshooting system designed to help DevOps and SRE teams diagnose Kubernetes clusters using AI.

## Architecture Overview

```text
Frontend (Next.js)
    ↓
FastAPI Backend (FastAPI)
    ↓
Kubernetes Investigation Layer (Kubectl / API)
    ↓
AI Kubernetes Agent
    ↓
LLM Reasoning (OpenRouter via InsForge)
    ↓
Root Cause + Suggested Fix
    ↓
Frontend Diagnosis
```

## Running the Application

To build and run the backend and frontend in Docker, execute:

```bash
docker compose up --build
```

Access the services:
- **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend /health**: [http://localhost:8000/health](http://localhost:8000/health)
