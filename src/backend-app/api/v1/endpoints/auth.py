import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Query
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import Optional, Union, List
from helpers.auth_helper import AuthHelper
from deps import get_auth_helper
from sqlmodel import select
from schemas.user_schemas import (
    CreateUserSchema, 
    CreateUserResponseSchema,
    CurrentUserResponseSchema,
    PaginatedUsersResponse,
    UpdateUserRoleSchema,
)
from data.models import UserRoleEnum
from pydantic import BaseModel
from data.models import User, UserCreationToken
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from typing import Annotated
from schemas.token_schemas import UserCreationTokenResponse
from sqlalchemy import desc, asc
from data.models import UserRole
from core.config import settings

# Stałe dla nazw ciasteczek
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"

class Token(BaseModel):
    """Model tokenu"""
    access_token: str
    """Token dostępu"""
    token_type: str
    """Typ tokenu"""
    refresh_token: str
    """Token odświeżający"""

class LogoutResponse(BaseModel):
    """Model odpowiedzi na wylogowanie"""
    message: str
    """Wiadomość"""

class LoginRequest(BaseModel):
    """Model żądania logowania"""
    username: str
    """Nazwa użytkownika"""
    password: str
    """Hasło"""

router = APIRouter()

def set_auth_cookies(response: Response, access_token: str, refresh_token: str, auth_helper: AuthHelper):
    """Helper function to set authentication cookies with proper security settings"""
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=60 * auth_helper.access_token_expire_minutes,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=60 * auth_helper.refresh_token_expire_minutes,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )

@router.post("/login", response_model=Token)
def login(
    request: LoginRequest,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Loguje użytkownika"""
    user = auth_helper.authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowa nazwa użytkownika lub hasło"
        )
    
    tokens = auth_helper.get_auth_tokens(user)
    response = JSONResponse(
        content={
            "access_token": tokens["access_token"],
            "token_type": "bearer",
            "refresh_token": tokens["refresh_token"]
        }
    )
    set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"], auth_helper)
    return response

@router.post("/refresh")
def refresh_token(
    response: Response,
    refresh_token: Annotated[Union[str, None], Cookie(alias=REFRESH_TOKEN_COOKIE)] = None,
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
    
    set_auth_cookies(response, new_access_token, new_refresh_token, auth_helper)
    return {"message": "Tokeny odświeżone"}

@router.post("/logout", response_model=LogoutResponse)
def logout(response: Response):
    """Wylogowuje użytkownika"""
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE,
        domain=settings.COOKIE_DOMAIN,
        path="/"
    )
    return LogoutResponse(message="Wylogowano pomyślnie")

@router.get("/me", response_model=CurrentUserResponseSchema)
def get_current_user(
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Pobiera informacje o bieżącym użytkowniku"""
    # Sprawdzamy czy użytkownik jest zalogowany
    auth_helper.verify_logged_in_user(access_token)
    
    # Pobieramy ID użytkownika z tokenu
    user_id = auth_helper.verify_token(access_token, "access")
    
    # Pobieramy dane użytkownika
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
    account_creation_token: Optional[str] = Query(None),
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Rejestruje nowego użytkownika"""
    # Sprawdzenie czy email już istnieje
    existing_user = auth_helper.session.exec(
        select(User).where(User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Użytkownik o podanym adresie email już istnieje"
        )
    
    user_data = user.model_dump()
    user_data["hashed_password"] = auth_helper.get_password_hash(user_data.pop("password"))

    # Dodanie domyślnej roli użytkownika
    user_data["role_id"] = UserRoleEnum.USER.value
    
    # Sprawdzenie czy token tworzenia konta jest poprawny
    if account_creation_token:
        token = auth_helper.session.get(UserCreationToken, account_creation_token)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Nieprawidłowy token tworzenia konta"
            )
        
        # Sprawdzenie czy token nie wygasł
        if token.expires_at < datetime.now():
            # Usuwamy przeterminowany token
            auth_helper.session.delete(token)
            auth_helper.session.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Token wygasł i został usunięty"
            )
        
        # Sprawdzenie czy token nie został już użyty maksymalną liczbę razy
        if token.uses >= token.max_uses:
            # Usuwamy wykorzystany token
            auth_helper.session.delete(token)
            auth_helper.session.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Token został już wykorzystany maksymalną liczbę razy i został usunięty"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Brak tokenu tworzenia konta w zapytaniu - nie można utworzyć użytkownika"
        )
        
    try:
        # Tworzenie nowego użytkownika
        new_user = User(**user_data)
        auth_helper.session.add(new_user)
        
        # Aktualizacja liczby użyć tokenu
        token.uses += 1
        
        # Jeśli token osiągnął limit użyć, usuwamy go
        if token.uses >= token.max_uses:
            auth_helper.session.delete(token)
        
        # Zatwierdzamy wszystkie zmiany
        auth_helper.session.commit()
        auth_helper.session.refresh(new_user)

        return CreateUserResponseSchema(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            role_id=new_user.role_id
        )
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/generate_account_creation_token", response_model=UserCreationTokenResponse)
def generate_account_creation_token(
    max_uses: int = 1,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Generuje token tworzenia konta (tylko dla administratorów)"""
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.ADMIN)
    
    # Generowanie tokenu
    token = UserCreationToken(
        id=str(uuid.uuid4()),
        max_uses=max_uses,
        uses=0,
        expires_at=datetime.now() + timedelta(minutes=10)
    )
    auth_helper.session.add(token)
    auth_helper.session.commit()
    auth_helper.session.refresh(token)
    
    return token

@router.delete("/delete-my-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    response: Response,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Usuwa własne konto użytkownika i wylogowuje go"""
    user = auth_helper.verify_logged_in_user(access_token)
    
    # Usunięcie konta
    try:
        auth_helper.session.delete(user)
        auth_helper.session.commit()
        
        # Usunięcie ciasteczek sesji
        response.delete_cookie(key=ACCESS_TOKEN_COOKIE)
        response.delete_cookie(key=REFRESH_TOKEN_COOKIE)
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas usuwania konta: {str(e)}"
        )

@router.get("/account-creation-tokens", response_model=List[UserCreationTokenResponse])
def get_account_creation_tokens(
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Pobiera listę wszystkich tokenów tworzenia kont (tylko dla administratorów)"""
    # Sprawdzenie uprawnień administratora
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.ADMIN)
    
    # Pobranie wszystkich tokenów
    tokens = auth_helper.session.exec(select(UserCreationToken)).all()
    
    # Usuwanie przestarzałych tokenów
    current_time = datetime.now()
    tokens_to_delete = []
    valid_tokens = []
    
    for token in tokens:
        if token.expires_at < current_time or token.uses >= token.max_uses:
            tokens_to_delete.append(token)
        else:
            valid_tokens.append(token)
    
    # Jeśli są tokeny do usunięcia, usuń je
    if tokens_to_delete:
        for token in tokens_to_delete:
            auth_helper.session.delete(token)
        auth_helper.session.commit()
    
    return valid_tokens

@router.delete("/account-creation-tokens/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account_creation_token(
    token_id: str,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Usuwa token tworzenia konta (tylko dla administratorów)"""
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.ADMIN)
    
    # Pobranie tokenu do usunięcia
    token = auth_helper.session.get(UserCreationToken, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token nie istnieje"
        )
    
    # Usunięcie tokenu
    try:
        auth_helper.session.delete(token)
        auth_helper.session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas usuwania tokenu: {str(e)}"
        )

@router.get("/users", response_model=PaginatedUsersResponse)
def get_users(
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper),
    page: int = Query(default=1, ge=1, description="Numer strony"),
    per_page: int = Query(default=10, ge=1, le=100, description="Ilość użytkowników na stronę"),
    sort_by: str = Query(
        default="id",
        regex="^(id|username|email|role_id)$",
        description="Pole po którym sortować"
    ),
    sort_order: str = Query(
        default="asc",
        regex="^(asc|desc)$",
        description="Kierunek sortowania"
    )
):
    """Pobiera paginowaną listę wszystkich użytkowników (tylko dla administratorów)"""
    # Sprawdzenie uprawnień administratora
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.ADMIN)
    
    # Przygotowanie zapytania
    query = select(User)
    
    # Dodanie sortowania
    sort_column = getattr(User, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Obliczenie całkowitej liczby użytkowników
    total = auth_helper.session.exec(select(User)).all().__len__()
    
    # Dodanie paginacji
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Pobranie użytkowników i konwersja na słowniki
    users = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role_id": user.role_id
        }
        for user in auth_helper.session.exec(query).all()
    ]
    
    # Obliczenie całkowitej liczby stron
    total_pages = (total + per_page - 1) // per_page
    
    return PaginatedUsersResponse(
        users=users,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Usuwa użytkownika (tylko dla administratorów)"""
    # Sprawdzenie uprawnień administratora
    current_user = auth_helper.verify_logged_in_user(access_token, UserRoleEnum.ADMIN)
    
    # Nie pozwalamy na usunięcie własnego konta
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nie można usunąć własnego konta"
        )
    
    # Pobranie użytkownika do usunięcia
    user = auth_helper.session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Użytkownik nie istnieje"
        )
    
    # Sprawdzenie czy użytkownik ma wystarczające uprawnienia do usunięcia danego użytkownika
    if user.role_id <= current_user.role_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nie można usunąć użytkownika o takiej samej lub wyższej roli"
        )
    
    try:
        # Usunięcie użytkownika
        auth_helper.session.delete(user)
        auth_helper.session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas usuwania użytkownika: {str(e)}"
        )

@router.put("/users/{user_id}/role", response_model=CurrentUserResponseSchema)
def update_user_role(
    user_id: int,
    role_update: UpdateUserRoleSchema,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
):
    """Aktualizuje rolę użytkownika (tylko dla super administratorów)"""
    # Sprawdzenie uprawnień super administratora
    current_user = auth_helper.verify_logged_in_user(access_token, UserRoleEnum.SUPER_ADMIN)
    
    # Pobranie użytkownika do modyfikacji
    user = auth_helper.session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Użytkownik nie istnieje"
        )
    
    # Sprawdzenie czy rola istnieje
    role = auth_helper.session.get(UserRole, role_update.role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podana rola nie istnieje"
        )
    
    # Nie pozwalamy na modyfikację roli super administratora
    if user.role_id == UserRoleEnum.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nie można modyfikować roli super administratora"
        )
    
    # Nie pozwalamy na nadanie roli super administratora
    if role_update.role_id == UserRoleEnum.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nie można nadać roli super administratora"
        )
    
    try:
        # Aktualizacja roli
        user.role_id = role_update.role_id
        auth_helper.session.add(user)
        auth_helper.session.commit()
        auth_helper.session.refresh(user)
        
        return CurrentUserResponseSchema.model_validate(user)
    except Exception as e:
        auth_helper.session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas aktualizacji roli: {str(e)}"
        )
