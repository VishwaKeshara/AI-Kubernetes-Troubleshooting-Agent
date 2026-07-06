from fastapi import APIRouter, HTTPException
from loguru import logger

from ai.agent import KubernetesAIAgent
from models.schemas import (
    DiagnosisPayload,
    InvestigateRequest,
    InvestigateResponse,
    InvestigationPayload,
)
from services.investigation import InvestigationService
from services.progress_publisher import ProgressPublisher

router = APIRouter(tags=["investigation"])


@router.post("/investigate", response_model=InvestigateResponse)
def investigate_cluster(request: InvestigateRequest = InvestigateRequest()) -> InvestigateResponse:
    try:
        publisher = None
        if request.investigation_id:
            publisher = ProgressPublisher(request.investigation_id)

        investigation = InvestigationService().run_investigation(
            on_progress=publisher.callback if publisher else None,
        )

        if publisher:
            publisher.publish("ai_reasoning", "AI Reasoning", "running")

        diagnosis = KubernetesAIAgent().diagnose(investigation)

        if publisher:
            publisher.publish("ai_reasoning", "AI Reasoning", "complete")
            publisher.publish("diagnosis", "Root Cause Found", "complete")

        return InvestigateResponse(
            status="success",
            investigation=InvestigationPayload(**investigation),
            diagnosis=DiagnosisPayload(**diagnosis),
        )
    except Exception as exc:
        logger.exception("Investigation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Investigation failed: {exc}",
        ) from exc
