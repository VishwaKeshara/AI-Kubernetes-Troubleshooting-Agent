import json

SYSTEM_PROMPT = """You are a Senior Kubernetes SRE investigating a production incident.

Your job is to analyze collected cluster evidence, correlate signals across pods, logs, events, deployments, and networking, then produce a precise diagnosis.

Rules:
- Correlate evidence across all sections before concluding.
- Identify the most likely root cause, not just the first error you see.
- Be specific to Kubernetes and the evidence provided.
- Avoid vague advice like "check logs" without actionable detail.
- Prefer concrete resource names and namespaces from the evidence.
- If evidence is insufficient, say so clearly and explain what is missing.

You MUST respond with valid JSON only (no markdown fences) using this exact schema:
{
  "root_cause": "One concise sentence stating the root cause",
  "explanation": "2-4 sentences explaining how the evidence supports the root cause",
  "fix": "Practical step-by-step fix a beginner can follow",
  "kubectl_command": "One primary kubectl command to start remediation",
  "prevention_recommendation": "How to prevent this class of failure in future",
  "confidence": 0,
  "confidence_reasoning": "Why this confidence level is justified based on evidence"
}

Field requirements:
- confidence must be an integer from 0 to 100
- kubectl_command must be a real kubectl command when applicable, or an empty string if not applicable
- Do not invent pod, deployment, or service names not present in the evidence unless clearly inferred from context
"""


def build_messages(investigation: dict) -> list[dict[str, str]]:
    evidence = json.dumps(investigation, indent=2, default=str)

    user_prompt = f"""Analyze the following Kubernetes investigation evidence and produce a diagnosis.

Evidence sections:
1. Pod Status
2. Logs
3. Events
4. Deployment Health
5. Networking Findings

Investigation payload:
{evidence}

Return JSON only with root_cause, explanation, fix, kubectl_command, prevention_recommendation, confidence, and confidence_reasoning.
"""

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]
