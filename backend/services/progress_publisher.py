import httpx
from loguru import logger

from core.config import settings


class ProgressPublisher:
    """Publish investigation progress to InsForge realtime channels."""

    def __init__(self, investigation_id: str) -> None:
        self.investigation_id = investigation_id
        self.channel = f"investigation:{investigation_id}"

    def publish(self, step: str, label: str, status: str = "running") -> None:
        payload = {
            "step": step,
            "label": label,
            "status": status,
            "investigation_id": self.investigation_id,
        }
        self._send_event("investigation_progress", payload)

    def callback(self, step: str, label: str, status: str) -> None:
        self.publish(step, label, status)

    def _send_event(self, event: str, payload: dict) -> None:
        if not settings.insforge_base_url or not settings.insforge_anon_key:
            logger.debug("InsForge realtime not configured; skipping progress publish")
            return

        url = f"{settings.insforge_base_url.rstrip('/')}/rest/v1/rpc/publish_investigation_progress"
        headers = {
            "apikey": settings.insforge_anon_key,
            "Authorization": f"Bearer {settings.insforge_anon_key}",
            "Content-Type": "application/json",
        }
        body = {
            "channel_name": self.channel,
            "event_name": event,
            "payload": payload,
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(url, headers=headers, json=body)

            if response.status_code >= 400:
                logger.warning(
                    "Failed to publish realtime progress ({}): {}",
                    response.status_code,
                    response.text[:200],
                )
        except httpx.RequestError as exc:
            logger.warning("Realtime publish error: {}", exc)
