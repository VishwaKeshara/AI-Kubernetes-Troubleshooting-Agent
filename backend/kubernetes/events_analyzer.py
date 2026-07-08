from kubernetes.kubectl import KubectlExecutor

TARGET_EVENT_REASONS = {
    "FailedScheduling",
    "BackOff",
    "FailedMount",
    "FailedPull",
    "ErrImagePull",
    "Unhealthy",
    "Failed",
    "FailedCreate",
    "FailedAttachVolume",
    "FailedPostStartHook",
}

WARNING_EVENT_TYPES = {"Warning"}


class EventsAnalyzer:
    """Analyze Kubernetes events and summarize findings."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()

    def analyze(self) -> dict:
        result = self.executor.run("get", "events", "-A", "--sort-by=.lastTimestamp", "-o", "json")

        if not result.success:
            return {
                "total_events": 0,
                "findings": [],
                "summary": "Unable to fetch cluster events.",
                "error": result.stderr or "Failed to fetch events",
            }

        data = result.json_output()
        if not isinstance(data, dict):
            return {
                "total_events": 0,
                "findings": [],
                "summary": "Unexpected response format from kubectl",
                "error": "Invalid events response",
            }

        items = data.get("items", [])
        findings: list[dict] = []

        for event in items:
            finding = self._evaluate_event(event)
            if finding:
                findings.append(finding)

        return {
            "total_events": len(items),
            "findings": findings[-30:],
            "summary": self._build_summary(findings),
        }

    def _evaluate_event(self, event: dict) -> dict | None:
        reason = event.get("reason", "")
        event_type = event.get("type", "")
        message = event.get("message", "")

        involved = event.get("involvedObject", {})
        is_relevant = reason in TARGET_EVENT_REASONS or (
            event_type in WARNING_EVENT_TYPES and reason in TARGET_EVENT_REASONS
        )

        if not is_relevant and event_type == "Warning":
            if any(keyword in message for keyword in ("failed", "error", "back-off", "unable")):
                is_relevant = True

        if not is_relevant:
            return None

        return {
            "reason": reason,
            "type": event_type,
            "namespace": involved.get("namespace", event.get("metadata", {}).get("namespace", "default")),
            "object": f"{involved.get('kind', 'Unknown')}/{involved.get('name', 'unknown')}",
            "message": message[:300],
            "count": event.get("count", 1),
            "last_timestamp": event.get("lastTimestamp") or event.get("eventTime"),
        }

    def _build_summary(self, findings: list[dict]) -> str:
        if not findings:
            return "No critical warning events detected."

        reason_counts: dict[str, int] = {}
        for finding in findings:
            reason = finding["reason"]
            reason_counts[reason] = reason_counts.get(reason, 0) + 1

        parts = [f"{reason} ({count})" for reason, count in sorted(reason_counts.items())]
        return f"Detected {len(findings)} relevant event(s): {', '.join(parts)}"
