from datetime import datetime, timedelta
from typing import Annotated, Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Cookie
from sqlalchemy.orm import Session
from data.models import User, UserRoleEnum
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
        statement = select(User).where(User.username == username)
        user = self.session.exec(statement).first()
        if not user:
            statement = select(User).where(User.email == username)
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

    def verify_logged_in_user(
        self,
        access_token: Optional[str] = Cookie(None),
        required_role: Optional[UserRoleEnum] = None
    ) -> User:
        """Sprawdza czy użytkownik jest zalogowany i ma wymagane uprawnienia
        
        Args:
            access_token: Token dostępu
            required_role: Wymagana rola użytkownika (opcjonalnie)
            
        Returns:
            User: Zalogowany użytkownik
            
        Raises:
            HTTPException: Gdy użytkownik nie jest zalogowany lub nie ma wymaganych uprawnień
        """
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nie zalogowano"
            )
        
        user_id = self.verify_token(access_token, "access")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nieprawidłowy token dostępu"
            )
        
        user = self.session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Użytkownik nie istnieje"
            )
        
        if required_role and user.role_id > required_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Brak wymaganych uprawnień: {required_role.name}"
            )
        
        return user

    