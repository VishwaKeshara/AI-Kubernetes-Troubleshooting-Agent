from fastapi import APIRouter, HTTPException
from loguru import logger

from ai.agent import KubernetesAIAgent
from kubernetes.kubectl import KubectlExecutor
from models.schemas import (
    DiagnosisPayload,
    InvestigateRequest,
    InvestigateResponse,
    InvestigationPayload,
)
from services.investigation import InvestigationService
from services.progress_publisher import ProgressPublisher

router = APIRouter(tags=["investigation"])


@router.get("/contexts")
def get_contexts():
    try:
        executor = KubectlExecutor()
        res = executor.run("config", "get-contexts", "-o", "name")
        if res.success:
            contexts = [line.strip() for line in res.stdout.splitlines() if line.strip()]
            return {"contexts": contexts}
        else:
            logger.warning("Failed to run config get-contexts: {}", res.stderr)
            return {"contexts": []}
    except Exception as exc:
        logger.exception("Failed to get contexts")
        return {"contexts": []}


@router.post("/investigate", response_model=InvestigateResponse)
def investigate_cluster(request: InvestigateRequest = InvestigateRequest()) -> InvestigateResponse:
    try:
        publisher = None
        if request.investigation_id:
            publisher = ProgressPublisher(request.investigation_id)

        investigation = InvestigationService(context=request.context).run_investigation(
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
