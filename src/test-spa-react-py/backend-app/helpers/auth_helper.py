from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from data.models import User
from sqlmodel import select
from core.config import settings

class AuthHelper:
    """Klasa pomocnicza do autoryzacji użytkowników"""
    def __init__(self, session: Session):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_minutes = settings.REFRESH_TOKEN_EXPIRE_MINUTES
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.session = session

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Weryfikacja hasła"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generowanie hasha hasła"""
        return self.pwd_context.hash(password)

    def create_token(self, data: dict, expires_delta: timedelta) -> str:
        """Tworzenie tokenu JWT"""
        to_encode = data.copy()
        expire = datetime.now() + expires_delta
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_access_token(self, user_id: int) -> str:
        """Tworzenie tokenu dostępu"""
        return self.create_token(
            {"sub": str(user_id), "type": "access"},
            timedelta(minutes=self.access_token_expire_minutes)
        )

    def create_refresh_token(self, user_id: int) -> str:
        """Tworzenie tokenu odświeżającego"""
        return self.create_token(
            {"sub": str(user_id), "type": "refresh"},
            timedelta(minutes=self.refresh_token_expire_minutes)
        )

    def verify_token(self, token: str, token_type: str) -> Optional[int]:
        """Weryfikacja tokenu JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != token_type:
                return None
            user_id = int(payload.get("sub"))
            return user_id
        except (JWTError, ValueError):
            return None

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Uwierzytelnianie użytkownika"""
        # Pobieranie użytkownika z bazy danych po nazwie użytkownika lub emailu
        statement = select(User).where(User.username == username | User.email == username)
        user = self.session.exec(statement).first()
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return user

    def get_auth_tokens(self, user: User) -> dict:
        """Generowanie tokenów dla użytkownika"""
        return {
            "access_token": self.create_access_token(user.id),
            "refresh_token": self.create_refresh_token(user.id)
        }

    