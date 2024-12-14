from pydantic import BaseModel
from datetime import datetime

class CreateUserSchema(BaseModel):
    """Schema dla tworzenia użytkownika"""
    email: str
    """Email użytkownika"""
    username: str
    """Nazwa użytkownika"""
    password: str
    """Hasło użytkownika"""

class CreateUserResponseSchema(BaseModel):
    """Schema dla odpowiedzi na tworzenie użytkownika"""
    id: int
    """ID użytkownika"""
    username: str
    """Nazwa użytkownika"""