from pydantic import BaseModel
from datetime import datetime

class CharacterCreationSchema(BaseModel):
    """Schema dla tworzenia postaci"""
    name: str | None 
    """Nazwa postaci"""
    description: str | None
    """Opis postaci"""
    image_url: str | None
    """URL do obrazu postaci"""


class CharacterCreationResponseSchema(BaseModel):
    """Schema dla odpowiedzi na tworzenie postaci"""
    id: int
    """ID postaci"""
    name: str
    """Nazwa postaci"""
    description: str
    """Opis postaci"""
    image_url: str
    created_at: datetime
    """Data utworzenia postaci"""
    updated_at: datetime
    """Data aktualizacji postaci"""

class CharacterCreationRequestSchema(BaseModel):
    """Schema dla żądania tworzenia postaci"""
    name: str
    """Nazwa postaci"""
    description: str
    """Opis postaci"""
    image_url: str
    """URL do obrazu postaci"""