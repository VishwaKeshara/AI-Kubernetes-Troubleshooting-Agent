import re

from kubernetes.kubectl import KubectlExecutor

ERROR_PATTERNS = re.compile(
    r"(?i)(exception|error|failed|failure|fatal|panic|"
    r"connection refused|connection reset|timeout|"
    r"missing env|no such file|cannot find|not found|"
    r"imagepullbackoff|crashloop|back-off|"
    r"permission denied|unauthorized|forbidden)",
)

MAX_LOG_LINES = 50
MAX_RELEVANT_LINES = 20


class LogsCollector:
    """Collect concise logs from failed or unhealthy pods."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()

    def collect(self, problematic_pods: list[dict]) -> dict:
        if not problematic_pods:
            return {
                "collected": 0,
                "entries": [],
                "summary": "No problematic pods found; log collection skipped.",
            }

        entries: list[dict] = []

        for pod in problematic_pods:
            entry = self._collect_pod_logs(
                name=pod.get("name", ""),
                namespace=pod.get("namespace", "default"),
                status=pod.get("status", ""),
            )
            if entry:
                entries.append(entry)

        return {
            "collected": len(entries),
            "entries": entries,
            "summary": self._build_summary(entries),
        }

    def _collect_pod_logs(self, name: str, namespace: str, status: str) -> dict | None:
        if not name:
            return None

        result = self.executor.run(
            "logs",
            name,
            "-n",
            namespace,
            f"--tail={MAX_LOG_LINES}",
        )

        logs = result.stdout if result.success else ""
        previous_logs = ""

        if status in {"CrashLoopBackOff", "Error", "OOMKilled"}:
            previous = self.executor.run(
                "logs",
                name,
                "-n",
                namespace,
                f"--tail={MAX_LOG_LINES}",
                "--previous",
            )
            if previous.success:
                previous_logs = previous.stdout

        combined = self._merge_logs(logs, previous_logs)
        relevant_lines = self._extract_relevant_lines(combined)

        if not relevant_lines and not result.success:
            return {
                "pod": name,
                "namespace": namespace,
                "status": status,
                "error": result.stderr or "Unable to fetch logs",
                "relevant_lines": [],
            }

        return {
            "pod": name,
            "namespace": namespace,
            "status": status,
            "relevant_lines": relevant_lines or combined[-MAX_RELEVANT_LINES:],
            "line_count": len(relevant_lines or combined),
        }

    def _merge_logs(self, current: str, previous: str) -> list[str]:
        lines: list[str] = []
        if previous:
            lines.extend(line for line in previous.splitlines() if line.strip())
            lines.append("--- previous container logs ---")
        if current:
            lines.extend(line for line in current.splitlines() if line.strip())
        return lines

    def _extract_relevant_lines(self, lines: list[str]) -> list[str]:
        relevant = [line for line in lines if ERROR_PATTERNS.search(line)]
        if relevant:
            return relevant[-MAX_RELEVANT_LINES:]
        return lines[-MAX_RELEVANT_LINES:]

    def _build_summary(self, entries: list[dict]) -> str:
        if not entries:
            return "No logs collected."

        pods_with_errors = sum(1 for entry in entries if entry.get("relevant_lines"))
        return f"Collected logs from {len(entries)} pod(s); {pods_with_errors} contain error indicators."
