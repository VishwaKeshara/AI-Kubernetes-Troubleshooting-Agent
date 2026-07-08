import sys
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    kubeconfig_path: str = ""
    cors_origins: str = '["http://localhost:3000"]'

settings = Settings()

# Setup logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)

app = FastAPI(title="AI Kubernetes Troubleshooting Agent Backend")

# Configure CORS
try:
    origins = json.loads(settings.cors_origins)
except Exception:
    origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting AI Kubernetes Troubleshooting Agent backend...")
    logger.info(f"Loaded config: MODEL={settings.openrouter_model}, KUBECONFIG={settings.kubeconfig_path}")

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint hit")
    return {
        "status": "healthy",
        "service": "ai-kubernetes-agent"
    }
