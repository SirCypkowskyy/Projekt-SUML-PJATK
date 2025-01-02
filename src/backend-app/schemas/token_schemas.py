from pydantic import BaseModel
from datetime import datetime

class UserCreationTokenResponse(BaseModel):
    """Schema odpowiedzi dla tokenu tworzenia konta"""
    id: str
    """ID tokenu"""
    max_uses: int
    """Maksymalna liczba użyć"""
    uses: int
    """Aktualna liczba użyć"""
    expires_at: datetime
    """Data wygaśnięcia tokenu"""

    class Config:
        """Konfiguracja schematu"""
        from_attributes = True