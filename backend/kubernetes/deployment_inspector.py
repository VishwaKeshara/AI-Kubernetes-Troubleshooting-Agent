from kubernetes.kubectl import KubectlExecutor


class DeploymentInspector:
    """Inspect deployments for replica and rollout issues."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()

    def inspect(self) -> dict:
        result = self.executor.run("get", "deployments", "-A", "-o", "json")

        if not result.success:
            return {
                "healthy": False,
                "total_deployments": 0,
                "problematic_deployments": [],
                "error": result.stderr or "Failed to fetch deployments",
            }

        data = result.json_output()
        if not isinstance(data, dict):
            return {
                "healthy": False,
                "total_deployments": 0,
                "problematic_deployments": [],
                "error": "Unexpected response format from kubectl",
            }

        items = data.get("items", [])
        problematic: list[dict] = []

        for deployment in items:
            issue = self._detect_deployment_issue(deployment)
            if issue:
                problematic.append(issue)

        return {
            "healthy": len(problematic) == 0,
            "total_deployments": len(items),
            "problematic_deployments": problematic,
        }

    def _detect_deployment_issue(self, deployment: dict) -> dict | None:
        metadata = deployment.get("metadata", {})
        spec = deployment.get("spec", {})
        status = deployment.get("status", {})

        name = metadata.get("name", "unknown")
        namespace = metadata.get("namespace", "default")

        desired = spec.get("replicas", 0)
        available = status.get("availableReplicas", 0) or 0
        unavailable = status.get("unavailableReplicas", 0) or 0
        ready = status.get("readyReplicas", 0) or 0
        updated = status.get("updatedReplicas", 0) or 0

        issues: list[str] = []
        conditions = status.get("conditions", [])

        if desired > 0 and available < desired:
            issues.append(f"available_replicas_low ({available}/{desired})")

        if unavailable > 0:
            issues.append(f"unavailable_replicas ({unavailable})")

        if desired > 0 and ready < desired:
            issues.append(f"ready_replicas_low ({ready}/{desired})")

        if desired > 0 and updated < desired:
            issues.append(f"rollout_incomplete ({updated}/{desired} updated)")

        for condition in conditions:
            condition_type = condition.get("type", "")
            condition_status = condition.get("status", "")
            reason = condition.get("reason", "")
            message = condition.get("message", "")

            if condition_type == "Available" and condition_status != "True":
                issues.append(f"condition_unavailable: {reason or message}")

            if condition_type == "Progressing" and condition_status == "False":
                issues.append(f"rollout_failed: {reason or message}")

        if not issues:
            return None

        return {
            "name": name,
            "namespace": namespace,
            "desired_replicas": desired,
            "available_replicas": available,
            "unavailable_replicas": unavailable,
            "ready_replicas": ready,
            "issues": issues,
        }
