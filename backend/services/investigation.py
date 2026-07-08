from typing import Callable

from loguru import logger

from kubernetes.deployment_inspector import DeploymentInspector
from kubernetes.events_analyzer import EventsAnalyzer
from kubernetes.kubectl import KubectlExecutor
from kubernetes.logs_collector import LogsCollector
from kubernetes.network_inspector import NetworkInspector
from kubernetes.pod_inspector import PodInspector

ProgressCallback = Callable[[str, str, str], None]


class InvestigationService:
    """Orchestrate Kubernetes evidence collection like a junior DevOps engineer."""

    def __init__(self, executor: KubectlExecutor | None = None, context: str | None = None) -> None:
        self.executor = executor or KubectlExecutor(context=context)
        self.pod_inspector = PodInspector(self.executor)
        self.logs_collector = LogsCollector(self.executor)
        self.events_analyzer = EventsAnalyzer(self.executor)
        self.deployment_inspector = DeploymentInspector(self.executor)
        self.network_inspector = NetworkInspector(self.executor)

    def run_investigation(self, on_progress: ProgressCallback | None = None) -> dict:
        logger.info("Starting Kubernetes investigation")

        self._emit_progress(on_progress, "pods", "Checking Pods", "running")
        pods = self.pod_inspector.inspect()
        self._emit_progress(on_progress, "pods", "Checking Pods", "complete")
        logger.info(
            "Pod inspection complete: {} problematic pod(s) found",
            len(pods.get("problematic_pods", [])),
        )

        self._emit_progress(on_progress, "logs", "Reading Logs", "running")
        logs = self.logs_collector.collect(pods.get("problematic_pods", []))
        self._emit_progress(on_progress, "logs", "Reading Logs", "complete")
        logger.info("Log collection complete: {} entr(ies)", logs.get("collected", 0))

        self._emit_progress(on_progress, "events", "Analyzing Events", "running")
        events = self.events_analyzer.analyze()
        self._emit_progress(on_progress, "events", "Analyzing Events", "complete")
        logger.info("Event analysis complete: {} finding(s)", len(events.get("findings", [])))

        self._emit_progress(on_progress, "deployments", "Inspecting Deployments", "running")
        deployments = self.deployment_inspector.inspect()
        self._emit_progress(on_progress, "deployments", "Inspecting Deployments", "complete")
        logger.info(
            "Deployment inspection complete: {} problematic deployment(s)",
            len(deployments.get("problematic_deployments", [])),
        )

        self._emit_progress(on_progress, "network", "Checking Networking", "running")
        network = self.network_inspector.inspect()
        self._emit_progress(on_progress, "network", "Checking Networking", "complete")
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

    def _emit_progress(
        self,
        on_progress: ProgressCallback | None,
        step: str,
        label: str,
        status: str,
    ) -> None:
        if on_progress:
            on_progress(step, label, status)


def run_investigation(on_progress: ProgressCallback | None = None, context: str | None = None) -> dict:
    return InvestigationService(context=context).run_investigation(on_progress=on_progress)
