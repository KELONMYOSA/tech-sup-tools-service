from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

    LDAP_PROVIDER_HOST: str
    LDAP_PROVIDER_PORT: int
    LDAP_PROVIDER_USER: str
    LDAP_PROVIDER_PASSWORD: str

    SECRET_KEY: str
    REFRESH_SECRET_KEY: str

    ORACLE_DB_URL: str

    ES_URL: str

    JIRA_URL: str
    JIRA_USER: str
    JIRA_PASSWORD: str


settings = Settings()
