from fastapi import APIRouter, HTTPException
from loguru import logger

from models.schemas import InvestigateResponse, InvestigationPayload
from services.investigation import InvestigationService

router = APIRouter(tags=["investigation"])


@router.post("/investigate", response_model=InvestigateResponse)
def investigate_cluster() -> InvestigateResponse:
    try:
        investigation = InvestigationService().run_investigation()
        return InvestigateResponse(
            status="success",
            investigation=InvestigationPayload(**investigation),
        )
    except Exception as exc:
        logger.exception("Investigation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Investigation failed: {exc}",
        ) from exc
