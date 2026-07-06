export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiError {
  message: string;
}

export interface Diagnosis {
  root_cause: string;
  explanation: string;
  fix: string;
  kubectl_command: string;
  prevention_recommendation: string;
  confidence: number;
  confidence_reasoning: string;
}

export interface InvestigationResult {
  status: string;
  investigation: {
    pods: Record<string, unknown>;
    logs: Record<string, unknown>;
    events: Record<string, unknown>;
    deployments: Record<string, unknown>;
    network: Record<string, unknown>;
  };
  diagnosis: Diagnosis;
}

export interface InvestigationHistoryItem {
  id: string;
  user_id: string;
  root_cause: string;
  namespace: string;
  confidence: number;
  status: string;
  created_at: string;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete";
}

export interface InvestigationProgressEvent {
  step: string;
  label: string;
  status: "running" | "complete";
  investigation_id: string;
}

export const INVESTIGATION_STEPS: ProgressStep[] = [
  { id: "pods", label: "Checking Pods", status: "pending" },
  { id: "logs", label: "Reading Logs", status: "pending" },
  { id: "events", label: "Analyzing Events", status: "pending" },
  { id: "deployments", label: "Inspecting Deployments", status: "pending" },
  { id: "network", label: "Checking Networking", status: "pending" },
  { id: "ai_reasoning", label: "AI Reasoning", status: "pending" },
  { id: "diagnosis", label: "Root Cause Found", status: "pending" },
];
