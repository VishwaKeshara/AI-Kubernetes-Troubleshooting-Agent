from kubernetes.kubectl import KubectlExecutor


class NetworkInspector:
    """Inspect services and networking configuration."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()

    def inspect(self) -> dict:
        services_result = self.executor.run("get", "svc", "-A", "-o", "json")
        endpoints_result = self.executor.run("get", "endpoints", "-A", "-o", "json")

        if not services_result.success:
            return {
                "healthy": False,
                "total_services": 0,
                "issues": [],
                "error": services_result.stderr or "Failed to fetch services",
            }

        services_data = services_result.json_output()
        if not isinstance(services_data, dict):
            return {
                "healthy": False,
                "total_services": 0,
                "issues": [],
                "error": "Unexpected services response format",
            }

        endpoints_map = self._build_endpoints_map(endpoints_result)
        services = services_data.get("items", [])
        issues: list[dict] = []

        for service in services:
            service_issues = self._inspect_service(service, endpoints_map)
            issues.extend(service_issues)

        return {
            "healthy": len(issues) == 0,
            "total_services": len(services),
            "issues": issues,
            "summary": self._build_summary(issues),
        }

    def _build_endpoints_map(self, endpoints_result) -> dict[tuple[str, str], dict]:
        endpoints_map: dict[tuple[str, str], dict] = {}

        if not endpoints_result.success:
            return endpoints_map

        data = endpoints_result.json_output()
        if not isinstance(data, dict):
            return endpoints_map

        for endpoint in data.get("items", []):
            metadata = endpoint.get("metadata", {})
            key = (metadata.get("namespace", "default"), metadata.get("name", ""))
            endpoints_map[key] = endpoint

        return endpoints_map

    def _inspect_service(self, service: dict, endpoints_map: dict[tuple[str, str], dict]) -> list[dict]:
        metadata = service.get("metadata", {})
        spec = service.get("spec", {})

        name = metadata.get("name", "unknown")
        namespace = metadata.get("namespace", "default")
        service_type = spec.get("type", "ClusterIP")
        selector = spec.get("selector") or {}
        cluster_ip = spec.get("clusterIP", "")

        issues: list[dict] = []

        if service_type == "ClusterIP" and cluster_ip == "None":
            return issues

        if service_type in {"ClusterIP", "NodePort", "LoadBalancer"} and not selector:
            if name == "kubernetes" and namespace == "default":
                return issues
            issues.append(
                {
                    "service": name,
                    "namespace": namespace,
                    "type": service_type,
                    "issue": "missing_selector",
                    "detail": "Service has no pod selector configured.",
                }
            )
            return issues

        if service_type == "ExternalName":
            return issues

        endpoint = endpoints_map.get((namespace, name))
        if endpoint is None:
            issues.append(
                {
                    "service": name,
                    "namespace": namespace,
                    "type": service_type,
                    "issue": "missing_endpoints",
                    "detail": "No Endpoints resource found for this service.",
                }
            )
            return issues

        subsets = endpoint.get("subsets") or []
        address_count = sum(len(subset.get("addresses") or []) for subset in subsets)

        if address_count == 0:
            issues.append(
                {
                    "service": name,
                    "namespace": namespace,
                    "type": service_type,
                    "issue": "missing_endpoints",
                    "detail": "Service selector does not match any ready pods.",
                    "selector": selector,
                }
            )
            return issues

        return issues

    def _build_summary(self, issues: list[dict]) -> str:
        if not issues:
            return "No networking issues detected."

        issue_types: dict[str, int] = {}
        for issue in issues:
            issue_type = issue.get("issue", "unknown")
            issue_types[issue_type] = issue_types.get(issue_type, 0) + 1

        parts = [f"{issue_type} ({count})" for issue_type, count in sorted(issue_types.items())]
        return f"Found {len(issues)} networking issue(s): {', '.join(parts)}"
