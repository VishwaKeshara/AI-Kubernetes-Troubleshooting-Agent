import json
import re

from loguru import logger


class RootCauseAnalyzer:
    """Parse and validate LLM diagnosis output."""

    REQUIRED_FIELDS = {
        "root_cause",
        "explanation",
        "fix",
        "kubectl_command",
        "prevention_recommendation",
        "confidence",
        "confidence_reasoning",
    }

    def analyze(self, llm_response: str) -> dict:
        parsed = self._parse_response(llm_response)
        return self._normalize_diagnosis(parsed)

    def _parse_response(self, llm_response: str) -> dict:
        cleaned = llm_response.strip()

        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            data = json.loads(cleaned)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            logger.warning("LLM response was not valid JSON; attempting extraction")

        extracted = self._extract_json_object(cleaned)
        if extracted:
            return extracted

        return {
            "root_cause": "Unable to determine root cause from AI response",
            "explanation": cleaned[:500] or "The AI response could not be parsed as structured JSON.",
            "fix": "Re-run investigation or review raw investigation evidence manually.",
            "kubectl_command": "",
            "prevention_recommendation": "Ensure monitoring covers pod restarts, events, and deployment health.",
            "confidence": 20,
            "confidence_reasoning": "Low confidence because the AI response was not structured JSON.",
        }

    def _extract_json_object(self, text: str) -> dict | None:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return None

        try:
            data = json.loads(match.group(0))
            return data if isinstance(data, dict) else None
        except json.JSONDecodeError:
            return None

    def _normalize_diagnosis(self, data: dict) -> dict:
        diagnosis = {
            "root_cause": str(data.get("root_cause", "")).strip(),
            "explanation": str(data.get("explanation", "")).strip(),
            "fix": str(data.get("fix", "")).strip(),
            "kubectl_command": str(data.get("kubectl_command", "")).strip(),
            "prevention_recommendation": str(data.get("prevention_recommendation", "")).strip(),
            "confidence": self._parse_confidence(data.get("confidence")),
            "confidence_reasoning": str(data.get("confidence_reasoning", "")).strip(),
        }

        for field in ("root_cause", "explanation", "fix", "prevention_recommendation"):
            if not diagnosis[field]:
                diagnosis[field] = "Not enough evidence to determine this field."

        return diagnosis

    def _parse_confidence(self, value) -> int:
        try:
            score = int(float(value))
        except (TypeError, ValueError):
            return 50
        return max(0, min(100, score))
