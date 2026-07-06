from loguru import logger

from ai.confidence_engine import ConfidenceEngine
from ai.fix_recommender import FixRecommendationEngine
from ai.llm_client import LLMClientError, OpenRouterClient
from ai.prompt_builder import build_messages
from ai.root_cause_analyzer import RootCauseAnalyzer


class KubernetesAIAgent:
    """Senior Kubernetes SRE-style reasoning over investigation evidence."""

    def __init__(
        self,
        llm_client: OpenRouterClient | None = None,
        root_cause_analyzer: RootCauseAnalyzer | None = None,
        fix_recommender: FixRecommendationEngine | None = None,
        confidence_engine: ConfidenceEngine | None = None,
    ) -> None:
        self.llm_client = llm_client or OpenRouterClient()
        self.root_cause_analyzer = root_cause_analyzer or RootCauseAnalyzer()
        self.fix_recommender = fix_recommender or FixRecommendationEngine()
        self.confidence_engine = confidence_engine or ConfidenceEngine()

    def diagnose(self, investigation: dict) -> dict:
        logger.info("Starting AI diagnosis")

        try:
            messages = build_messages(investigation)
            llm_response = self.llm_client.chat_completion(messages)
            diagnosis = self.root_cause_analyzer.analyze(llm_response)
            diagnosis = self.fix_recommender.build(diagnosis, investigation)
            diagnosis = self.confidence_engine.score(diagnosis, investigation)
            logger.info("AI diagnosis complete with confidence {}", diagnosis.get("confidence"))
            return diagnosis

        except LLMClientError as exc:
            logger.error("AI diagnosis failed: {}", exc)
            return self._fallback_diagnosis(str(exc), investigation)

    def _fallback_diagnosis(self, error_message: str, investigation: dict) -> dict:
        fallback = {
            "root_cause": "AI analysis unavailable",
            "explanation": error_message,
            "fix": "Configure OPENROUTER_API_KEY and OPENROUTER_MODEL, then retry the investigation.",
            "kubectl_command": "",
            "prevention_recommendation": "Store LLM credentials securely in environment variables.",
            "confidence": 0,
            "confidence_reasoning": "No AI reasoning was performed.",
        }
        return self.fix_recommender.build(fallback, investigation)


def analyze_cluster_data(investigation: dict) -> dict:
    return KubernetesAIAgent().diagnose(investigation)


def generate_diagnosis(investigation: dict) -> dict:
    return KubernetesAIAgent().diagnose(investigation)
