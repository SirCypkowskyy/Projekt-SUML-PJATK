import os
import json
from typing import Dict, List
import typing as ty
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from enum import Enum


class ModeEnum(str, Enum):
    """Enum okr

    Args:
        str (_type_): nazwa trybu
        Enum (_type_): Enum
    """
    development = "development"
    production = "production"
    testing = "testing"


class Settings(BaseSettings):
    """Klasa Settings zawierająca konfigurację aplikacji"""
    MODE_STR: str
    """Nazwa trybu działania aplikacji"""
    MODE: ModeEnum = ModeEnum.development if MODE_STR == "development" else ModeEnum.production
    """Tryb działania aplikacji"""
    PROJECT_NAME: str = "Przewodnik Apokalipsy"    
    """Nazwa projektu"""
    PROJECT_VERSION: str = "0.0.1"
    """Wersja projektu"""
    PROJECT_DESCRIPTION: str = "Przewodnik Apokalipsy"
    """Opis projektu"""
    API_VERSION: str = "v1"
    """Wersja API"""
    API_V1_STR: str = f"/api/{API_VERSION}"
    """Ścieżka API"""
    OPENAI_API_KEY: str
    """Klucz API OpenAI"""
    SQLITE_FILE_NAME: str = "database.db"
    """Nazwa pliku bazy danych"""
    SECRET_KEY: str
    """Klucz sekretny dla autoryzacji z ciasteczkami"""
    ALGORITHM: str = "HS256"
    """Algorytm autoryzacji"""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    """Czas ważności tokena dostępu"""
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    """Czas ważności tokena odświeżania (domyślnie 1 dzień)"""
    BASE_ADMIN_USERNAME: str = "admin"
    """Nazwa użytkownika pierwszego admina"""
    BASE_ADMIN_EMAIL: str = "admin@suml.cyprian-gburek.pl"
    """Email pierwszego admina"""
    BASE_ADMIN_PASSWORD: str
    """Hasło pierwszego admina"""

    BACKEND_CORS_ORIGINS: str
    @field_validator("BACKEND_CORS_ORIGINS")
    def assemble_cors_origins(cls, v: ty.Union[str, list[str]]) -> ty.Union[list[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    DATABASE_URL: str = "sqlite:///./database.db"
    """URL do bazy danych"""

    # Cookie settings
    COOKIE_DOMAIN: str = "localhost" if MODE == ModeEnum.development else "suml.cyprian-gburek.pl"
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: str = "none" if MODE == ModeEnum.development else "lax"

    @property
    def initial_data(self) -> Dict:
        """Wczytuje dane początkowe z pliku JSON"""
        json_path = './initial_data.json'
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            return {
                "user_roles": [],
                "character_classes": [],
                "dedicated_moves": []
            }
            
    # Tylko dev
    if MODE == ModeEnum.development:
        model_config = SettingsConfigDict(
            case_sensitive=True, env_file=os.path.expanduser("~/sumlapp/.env")
        )


settings = Settings()