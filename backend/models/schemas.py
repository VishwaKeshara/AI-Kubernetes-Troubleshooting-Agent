from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class InvestigationPayload(BaseModel):
    pods: dict
    logs: dict
    events: dict
    deployments: dict
    network: dict


class InvestigateResponse(BaseModel):
    status: str = Field(default="success")
    investigation: InvestigationPayload
