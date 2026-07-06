class FixRecommendationEngine:
    """Validate and format actionable Kubernetes fix recommendations."""

    GENERIC_FIX_PHRASES = (
        "check the logs",
        "investigate further",
        "contact support",
        "look into the issue",
    )

    def build(self, diagnosis: dict, investigation: dict) -> dict:
        fix = diagnosis.get("fix", "").strip()
        kubectl_command = diagnosis.get("kubectl_command", "").strip()

        if self._is_generic(fix):
            fix = self._fallback_fix(investigation)

        if not kubectl_command:
            kubectl_command = self._fallback_kubectl_command(investigation)

        diagnosis["fix"] = fix
        diagnosis["kubectl_command"] = kubectl_command
        return diagnosis

    def _is_generic(self, fix: str) -> bool:
        lowered = fix.lower()
        return not fix or any(phrase in lowered for phrase in self.GENERIC_FIX_PHRASES)

    def _fallback_fix(self, investigation: dict) -> str:
        pods = investigation.get("pods", {}).get("problematic_pods") or []
        deployments = investigation.get("deployments", {}).get("problematic_deployments") or []
        network_issues = investigation.get("network", {}).get("issues") or []

        if pods:
            pod = pods[0]
            return (
                f"Inspect pod `{pod.get('name')}` in namespace `{pod.get('namespace')}` "
                f"and address the `{pod.get('status')}` condition shown in the evidence."
            )

        if deployments:
            deployment = deployments[0]
            return (
                f"Review deployment `{deployment.get('name')}` in namespace `{deployment.get('namespace')}` "
                f"and reconcile replica/rollout issues: {', '.join(deployment.get('issues', []))}."
            )

        if network_issues:
            issue = network_issues[0]
            return (
                f"Fix networking for service `{issue.get('service')}` in namespace `{issue.get('namespace')}` "
                f"by resolving `{issue.get('issue')}`."
            )

        return "Review the investigation evidence and remediate the highest-severity Kubernetes signal first."

    def _fallback_kubectl_command(self, investigation: dict) -> str:
        pods = investigation.get("pods", {}).get("problematic_pods") or []
        if pods:
            pod = pods[0]
            return (
                f"kubectl describe pod {pod.get('name')} -n {pod.get('namespace')}"
            )

        deployments = investigation.get("deployments", {}).get("problematic_deployments") or []
        if deployments:
            deployment = deployments[0]
            return (
                f"kubectl describe deployment {deployment.get('name')} "
                f"-n {deployment.get('namespace')}"
            )

        events = investigation.get("events", {}).get("findings") or []
        if events:
            event = events[0]
            namespace = event.get("namespace", "default")
            return f"kubectl get events -n {namespace} --sort-by=.lastTimestamp"

        return "kubectl get pods -A"
