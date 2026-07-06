from datetime import datetime, timezone

from kubernetes.kubectl import KubectlExecutor

UNHEALTHY_WAITING_REASONS = {
    "CrashLoopBackOff",
    "ImagePullBackOff",
    "ErrImagePull",
    "ContainerCreating",
    "CreateContainerConfigError",
    "CreateContainerError",
    "InvalidImageName",
}

UNHEALTHY_TERMINATED_REASONS = {
    "Error",
    "OOMKilled",
}

UNHEALTHY_PHASES = {
    "Pending",
    "Failed",
    "Unknown",
}

CONTAINER_CREATING_STUCK_MINUTES = 5


class PodInspector:
    """Inspect pod status and detect unhealthy pods."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()

    def inspect(self) -> dict:
        result = self.executor.run("get", "pods", "-A", "-o", "json")

        if not result.success:
            return {
                "healthy": False,
                "total_pods": 0,
                "problematic_pods": [],
                "error": result.stderr or "Failed to fetch pods",
            }

        data = result.json_output()
        if not isinstance(data, dict):
            return {
                "healthy": False,
                "total_pods": 0,
                "problematic_pods": [],
                "error": "Unexpected response format from kubectl",
            }

        items = data.get("items", [])
        problematic_pods: list[dict] = []

        for pod in items:
            issue = self._detect_pod_issue(pod)
            if issue:
                problematic_pods.append(issue)

        return {
            "healthy": len(problematic_pods) == 0,
            "total_pods": len(items),
            "problematic_pods": problematic_pods,
        }

    def _detect_pod_issue(self, pod: dict) -> dict | None:
        metadata = pod.get("metadata", {})
        status = pod.get("status", {})
        name = metadata.get("name", "unknown")
        namespace = metadata.get("namespace", "default")
        phase = status.get("phase", "Unknown")

        issues: list[str] = []

        if phase in UNHEALTHY_PHASES:
            issues.append(phase)

        for container_status in self._all_container_statuses(pod):
            waiting = container_status.get("state", {}).get("waiting", {})
            terminated = container_status.get("state", {}).get("terminated", {})

            waiting_reason = waiting.get("reason", "")
            terminated_reason = terminated.get("reason", "")

            if waiting_reason in UNHEALTHY_WAITING_REASONS:
                if waiting_reason == "ContainerCreating" and not self._is_container_creating_stuck(
                    metadata, waiting
                ):
                    continue
                issues.append(waiting_reason)

            if terminated_reason in UNHEALTHY_TERMINATED_REASONS:
                issues.append(terminated_reason)

            if not container_status.get("ready", False) and container_status.get("restartCount", 0) > 0:
                if "CrashLoopBackOff" not in issues:
                    issues.append("CrashLoopBackOff")

        if not issues:
            return None

        primary_status = issues[0]
        return {
            "name": name,
            "namespace": namespace,
            "status": primary_status,
            "issues": sorted(set(issues)),
            "phase": phase,
        }

    def _all_container_statuses(self, pod: dict) -> list[dict]:
        status = pod.get("status", {})
        containers = status.get("containerStatuses") or []
        init_containers = status.get("initContainerStatuses") or []
        return containers + init_containers

    def _is_container_creating_stuck(self, metadata: dict, waiting: dict) -> bool:
        creation_timestamp = metadata.get("creationTimestamp")
        if not creation_timestamp:
            return True

        try:
            created_at = datetime.fromisoformat(creation_timestamp.replace("Z", "+00:00"))
        except ValueError:
            return True

        age_minutes = (datetime.now(timezone.utc) - created_at).total_seconds() / 60
        return age_minutes >= CONTAINER_CREATING_STUCK_MINUTES
