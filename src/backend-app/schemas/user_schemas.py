from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from data.models import UserRoleEnum
from .base_schemas import PaginatedResponse

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
    email: str
    """Email użytkownika"""
    role_id: int
    """ID roli użytkownika"""

    class Config:
        """Konfiguracja schematu"""
        from_attributes = True

class CurrentUserResponseSchema(BaseModel):
    """Schema dla odpowiedzi z danymi aktualnego użytkownika"""
    id: int
    """ID użytkownika"""
    username: str
    """Nazwa użytkownika"""
    email: str
    """Email użytkownika"""
    role_id: int
    """ID roli użytkownika"""

    class Config:
        """Konfiguracja schematu"""
        from_attributes = True

class UserListItemSchema(BaseModel):
    """Model użytkownika w liście"""
    id: int
    username: str
    email: str
    role_id: Optional[int] = None

class PaginatedUsersResponse(PaginatedResponse):
    """Model odpowiedzi z paginowaną listą użytkowników"""
    users: List[UserListItemSchema]

class UpdateUserRoleSchema(BaseModel):
    """Schema dla aktualizacji roli użytkownika"""
    role_id: int
    """ID nowej roli użytkownika"""