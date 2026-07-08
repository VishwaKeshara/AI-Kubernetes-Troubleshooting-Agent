import json
import subprocess
from dataclasses import dataclass, field

from loguru import logger

from core.config import settings


@dataclass
class KubectlResult:
    success: bool
    stdout: str
    stderr: str
    return_code: int
    command: list[str] = field(default_factory=list)

    def json_output(self) -> dict | list | None:
        if not self.success or not self.stdout.strip():
            return None
        try:
            return json.loads(self.stdout)
        except json.JSONDecodeError:
            logger.warning("Failed to parse kubectl JSON output for: {}", " ".join(self.command))
            return None


class KubectlExecutor:
    """Safely execute kubectl commands and return structured output."""

    def __init__(self, kubeconfig_path: str | None = None, timeout: int = 60, context: str | None = None) -> None:
        self.kubeconfig_path = kubeconfig_path or settings.kubeconfig_path or None
        self.timeout = timeout
        self.context = context

    def run(self, *args: str) -> KubectlResult:
        command = self._build_command(*args)
        logger.info("Running kubectl: {}", " ".join(command))

        try:
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                check=False,
            )
        except FileNotFoundError:
            message = "kubectl not found. Ensure kubectl is installed and in PATH."
            logger.error(message)
            return KubectlResult(
                success=False,
                stdout="",
                stderr=message,
                return_code=127,
                command=command,
            )
        except subprocess.TimeoutExpired:
            message = f"kubectl command timed out after {self.timeout}s"
            logger.error("{}: {}", message, " ".join(command))
            return KubectlResult(
                success=False,
                stdout="",
                stderr=message,
                return_code=124,
                command=command,
            )

        result = KubectlResult(
            success=completed.returncode == 0,
            stdout=completed.stdout.strip(),
            stderr=completed.stderr.strip(),
            return_code=completed.returncode,
            command=command,
        )

        if result.success:
            logger.debug("kubectl succeeded: {}", " ".join(command))
        else:
            logger.warning(
                "kubectl failed (code {}): {} | stderr: {}",
                result.return_code,
                " ".join(command),
                result.stderr,
            )

        return result

    def _build_command(self, *args: str) -> list[str]:
        command = ["kubectl"]
        if self.kubeconfig_path:
            command.extend(["--kubeconfig", self.kubeconfig_path])
        if self.context:
            command.extend(["--context", self.context])
        command.extend(args)
        return command
