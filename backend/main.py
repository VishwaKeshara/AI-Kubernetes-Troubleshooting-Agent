from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from api.routes.health import router as health_router
from api.routes.investigate import router as investigate_router
from core.config import settings
from core.logging import setup_logging


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title="AI Kubernetes Agent",
        description="On-demand Kubernetes troubleshooting with AI",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(investigate_router)

    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("Starting {}", settings.app_name)

    return app


app = create_app()
