from kubernetes.deployment_inspector import DeploymentInspector
from kubernetes.events_analyzer import EventsAnalyzer
from kubernetes.kubectl import KubectlExecutor
from kubernetes.logs_collector import LogsCollector
from kubernetes.network_inspector import NetworkInspector
from kubernetes.pod_inspector import PodInspector


def inspect_pods(executor: KubectlExecutor | None = None) -> dict:
    return PodInspector(executor).inspect()


def inspect_deployments(executor: KubectlExecutor | None = None) -> dict:
    return DeploymentInspector(executor).inspect()


def inspect_events(executor: KubectlExecutor | None = None) -> dict:
    return EventsAnalyzer(executor).analyze()


def collect_logs(problematic_pods: list[dict], executor: KubectlExecutor | None = None) -> dict:
    return LogsCollector(executor).collect(problematic_pods)


def inspect_network(executor: KubectlExecutor | None = None) -> dict:
    return NetworkInspector(executor).inspect()
