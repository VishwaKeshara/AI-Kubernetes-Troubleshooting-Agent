import os
from loguru import logger
from pydantic_settings import BaseSettings, SettingsConfigDict


def setup_kubeconfig():
    host_config = "/app/kubeconfig-host"
    target_config = "/app/kubeconfig"
    
    if os.path.exists(host_config):
        try:
            logger.info("Found host kubeconfig at {}, preparing container kubeconfig...", host_config)
            with open(host_config, "r") as f:
                content = f.read()
            
            # Replace localhost references so container can reach host machine
            content = content.replace("127.0.0.1", "host.docker.internal")
            content = content.replace("localhost", "host.docker.internal")
            
            os.makedirs(os.path.dirname(target_config), exist_ok=True)
            with open(target_config, "w") as f:
                f.write(content)
            
            # Update active environment variables
            os.environ["KUBECONFIG_PATH"] = target_config
            logger.info("Kubeconfig successfully prepared at {}", target_config)
        except Exception as e:
            logger.exception("Failed to copy/translate host kubeconfig: {}", e)
    else:
        logger.warning("Host kubeconfig not found at {}. If running locally, check your volume mount.", host_config)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "ai-kubernetes-agent"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]

    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    kubeconfig_path: str = ""
    openrouter_timeout: float = 60.0
    openrouter_max_retries: int = 3

    insforge_base_url: str = "https://icxn67z7.us-east.insforge.app"
    insforge_anon_key: str = ""


# Setup local kubeconfig translation before instantiating settings
setup_kubeconfig()

settings = Settings()
if os.path.exists("/app/kubeconfig"):
    settings.kubeconfig_path = "/app/kubeconfig"
