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


class DiagnosisPayload(BaseModel):
    root_cause: str
    explanation: str
    fix: str
    kubectl_command: str
    prevention_recommendation: str
    confidence: int = Field(ge=0, le=100)
    confidence_reasoning: str = ""


class InvestigateResponse(BaseModel):
    status: str = Field(default="success")
    investigation: InvestigationPayload
    diagnosis: DiagnosisPayload
