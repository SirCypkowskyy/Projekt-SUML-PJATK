from typing import Any, Optional

from pydantic import BaseModel, Field


class GenericApiResponseDto(BaseModel):
    """
    Klasa DTO do zwracania odpowiedzi z API
    
    Attributes:
    
    data: Any - Dane zwracane przez API
    message: str - Wiadomość zwracana przez API
    status_code: int - Kod statusu HTTP
    error: Optional[str] - Błąd zwracany przez API
    """
    data: Any = Field(None, description="Dane zwracane przez API")
    """
    data: Any - Dane zwracane przez API"""
    message: str = Field(None, description="Wiadomość zwracana przez API")
    """
    message: str - Wiadomość zwracana przez API"""
    status_code: int = Field(None, description="Kod statusu HTTP", examples=[200, 400, 404, 500])
    """
    status_code: int - Kod statusu HTTP"""
    error: Optional[str] = Field(None, description="Błąd zwracany przez API")
    """
    error: Optional[str] - Błąd zwracany przez API"""