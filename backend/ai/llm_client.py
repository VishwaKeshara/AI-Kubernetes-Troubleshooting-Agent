import time

import httpx
from loguru import logger

from core.config import settings

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "openai/gpt-4o-mini"
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 1.5


class LLMClientError(Exception):
    """Raised when the LLM client cannot complete a request."""


class OpenRouterClient:
    """Call OpenRouter using HTTPX with retries and safe error handling."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float | None = None,
        max_retries: int | None = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else settings.openrouter_api_key
        self.model = model or settings.openrouter_model or DEFAULT_MODEL
        self.timeout = timeout if timeout is not None else settings.openrouter_timeout
        self.max_retries = max_retries if max_retries is not None else settings.openrouter_max_retries

    def chat_completion(self, messages: list[dict[str, str]]) -> str:
        if not self.api_key:
            raise LLMClientError("OPENROUTER_API_KEY is not configured")

        url = f"{OPENROUTER_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-kubernetes-agent.local",
            "X-Title": "AI Kubernetes Agent",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }

        last_error = "Unknown LLM error"

        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(
                    "Calling OpenRouter model {} (attempt {}/{})",
                    self.model,
                    attempt,
                    self.max_retries,
                )

                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)

                if response.status_code in {429, 500, 502, 503, 504}:
                    last_error = f"OpenRouter temporary error ({response.status_code})"
                    logger.warning("{} - retrying", last_error)
                    self._sleep_before_retry(attempt)
                    continue

                if response.status_code >= 400:
                    detail = self._safe_error_detail(response)
                    raise LLMClientError(f"OpenRouter request failed ({response.status_code}): {detail}")

                data = response.json()
                content = self._extract_content(data)
                if not content:
                    raise LLMClientError("OpenRouter returned an empty response")

                logger.info("OpenRouter response received successfully")
                return content

            except httpx.TimeoutException:
                last_error = f"OpenRouter request timed out after {self.timeout}s"
                logger.warning("{} - retrying", last_error)
                self._sleep_before_retry(attempt)
            except httpx.RequestError as exc:
                last_error = f"OpenRouter network error: {exc}"
                logger.warning("{} - retrying", last_error)
                self._sleep_before_retry(attempt)

        raise LLMClientError(last_error)

    def _extract_content(self, data: dict) -> str:
        choices = data.get("choices") or []
        if not choices:
            return ""
        message = choices[0].get("message") or {}
        return (message.get("content") or "").strip()

    def _safe_error_detail(self, response: httpx.Response) -> str:
        try:
            body = response.json()
            error = body.get("error") or {}
            if isinstance(error, dict):
                return error.get("message", response.text[:200])
            return str(error)[:200]
        except ValueError:
            return response.text[:200]

    def _sleep_before_retry(self, attempt: int) -> None:
        if attempt < self.max_retries:
            time.sleep(RETRY_BACKOFF_SECONDS * attempt)
