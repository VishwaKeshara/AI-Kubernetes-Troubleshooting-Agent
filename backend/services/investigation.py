from loguru import logger

from kubernetes.deployment_inspector import DeploymentInspector
from kubernetes.events_analyzer import EventsAnalyzer
from kubernetes.kubectl import KubectlExecutor
from kubernetes.logs_collector import LogsCollector
from kubernetes.network_inspector import NetworkInspector
from kubernetes.pod_inspector import PodInspector


class InvestigationService:
    """Orchestrate Kubernetes evidence collection like a junior DevOps engineer."""

    def __init__(self, executor: KubectlExecutor | None = None) -> None:
        self.executor = executor or KubectlExecutor()
        self.pod_inspector = PodInspector(self.executor)
        self.logs_collector = LogsCollector(self.executor)
        self.events_analyzer = EventsAnalyzer(self.executor)
        self.deployment_inspector = DeploymentInspector(self.executor)
        self.network_inspector = NetworkInspector(self.executor)

    def run_investigation(self) -> dict:
        logger.info("Starting Kubernetes investigation")

        pods = self.pod_inspector.inspect()
        logger.info(
            "Pod inspection complete: {} problematic pod(s) found",
            len(pods.get("problematic_pods", [])),
        )

        logs = self.logs_collector.collect(pods.get("problematic_pods", []))
        logger.info("Log collection complete: {} entr(ies)", logs.get("collected", 0))

        events = self.events_analyzer.analyze()
        logger.info("Event analysis complete: {} finding(s)", len(events.get("findings", [])))

        deployments = self.deployment_inspector.inspect()
        logger.info(
            "Deployment inspection complete: {} problematic deployment(s)",
            len(deployments.get("problematic_deployments", [])),
        )

        network = self.network_inspector.inspect()
        logger.info("Network inspection complete: {} issue(s)", len(network.get("issues", [])))

        investigation = {
            "pods": pods,
            "logs": logs,
            "events": events,
            "deployments": deployments,
            "network": network,
        }

        logger.info("Kubernetes investigation finished")
        return investigation


def run_investigation() -> dict:
    return InvestigationService().run_investigation()
