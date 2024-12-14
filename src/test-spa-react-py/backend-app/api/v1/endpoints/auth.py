import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Query
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from helpers.auth_helper import AuthHelper
from deps import get_auth_helper
from sqlmodel import select
from schemas.user_schemas import (
    CreateUserSchema, 
    CreateUserResponseSchema
)
from data.models import User, UserCreationToken
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Loguje użytkownika"""
    user = auth_helper.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowe dane logowania"
        )
    
    tokens = auth_helper.get_auth_tokens(user)
    
    response.set_cookie(
        key=".PrzewApo.Access_token",
        value=tokens[".PrzewApo.Access_token"],
        httponly=True,
        max_age=60 * auth_helper.access_token_expire_minutes,
        samesite="lax"
    )
    response.set_cookie(
        key=".PrzewApo.refresh_token",
        value=tokens[".PrzewApo.refresh_token"],
        httponly=True,
        max_age=60 * auth_helper.refresh_token_expire_minutes,
        samesite="lax"
    )
    
    return {"message": "Zalogowano pomyślnie"}

@router.post("/refresh")
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Odświeża tokeny"""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Brak tokenu odświeżającego"
        )
    
    user_id = auth_helper.verify_token(refresh_token, "refresh")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy token odświeżający"
        )
    
    new_access_token = auth_helper.create_access_token(user_id)
    new_refresh_token = auth_helper.create_refresh_token(user_id)
    
    response.set_cookie(
        key=".PrzewApo.Access_token",
        value=new_access_token,
        httponly=True,
        max_age=60 * auth_helper.access_token_expire_minutes,
        samesite="lax"
    )
    response.set_cookie(
        key=".PrzewApo.refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=60 * auth_helper.refresh_token_expire_minutes,
        samesite="lax"
    )
    
    return {"message": "Tokeny odświeżone"}

@router.post("/logout")
def logout(response: Response):
    """Wylogowuje użytkownika"""
    response.delete_cookie(key=".PrzewApo.Access_token")
    response.delete_cookie(key=".PrzewApo.refresh_token")
    return {"message": "Wylogowano pomyślnie"}

@router.get("/me")
def get_current_user(
    access_token: Optional[str] = Cookie(None),
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Pobiera informacje o bieżącym użytkowniku"""
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nie zalogowano"
        )
    
    user_id = auth_helper.verify_token(access_token, "access")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy token dostępu"
        )
    
    user = auth_helper.session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Użytkownik nie istnieje"
        )
    
    return user

@router.post("/register", response_model=CreateUserResponseSchema)
def register(
    user: CreateUserSchema,
    account_creation_token: str | None = Query(None),
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Rejestruje nowego użytkownika"""
    user_data = user.model_dump()
    user_data["hashed_password"] = auth_helper.get_password_hash(user_data.pop("password"))
    
    # Sprawdzenie czy token tworzenia konta jest poprawny
    if account_creation_token:
        token = auth_helper.session.exec(select(UserCreationToken).where(UserCreationToken.id == account_creation_token)).first()
        if not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nieprawidłowy token tworzenia konta")
        
        # Sprawdzenie czy token nie wygaśnie
        if token.expires_at < datetime.now():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token wygaśnieł")
        
        # Sprawdzenie czy token nie został już użyty maksymalną liczbę razy
        if token.uses >= token.max_uses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token został już użyty maksymalną liczbę razy")
        
    try:
        new_user = User(**user_data)
        auth_helper.session.add(new_user)
        auth_helper.session.commit()
        auth_helper.session.refresh(new_user)
        
        return CreateUserResponseSchema(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
        )
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/generate_account_creation_token")
def generate_account_creation_token(user_id: int, 
                                    max_uses: int = 1,
                                    auth_helper: AuthHelper = Depends(get_auth_helper)):
    """Generuje token tworzenia konta"""
    token = UserCreationToken(
        id=str(uuid.uuid4()),
        max_uses=max_uses,
        uses=0,
        expires_at=datetime.now() + timedelta(minutes=10)
    )
    auth_helper.session.add(token)
    auth_helper.session.commit()
    return token
