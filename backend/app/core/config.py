import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fullstack RBAC"
    SECRET_KEY: str = "a_very_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Oracle Database Settings
    ORACLE_USER: str = os.getenv("ORACLE_USER", "system")
    ORACLE_PASSWORD: str = os.getenv("ORACLE_PASSWORD", "password")
    ORACLE_DSN: str = os.getenv("ORACLE_DSN", "localhost:1521/freepdb1")
    
    @property
    def DATABASE_URL(self) -> str:
        # URL format for oracledb thick/thin mode in SQLAlchemy
        # If DSN is like localhost:1521/freepdb1, treat 'freepdb1' as a service name instead of a SID
        if "/" in self.ORACLE_DSN:
            host_port, service_name = self.ORACLE_DSN.split("/", 1)
            return f"oracle+oracledb://{self.ORACLE_USER}:{self.ORACLE_PASSWORD}@{host_port}/?service_name={service_name}"
        
        return f"oracle+oracledb://{self.ORACLE_USER}:{self.ORACLE_PASSWORD}@{self.ORACLE_DSN}"
        
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
