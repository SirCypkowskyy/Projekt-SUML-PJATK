from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum, IntEnum
from sqlalchemy import JSON, Column
from sqlalchemy.orm import relationship
from .database import engine

class UserRoleEnum(IntEnum):
    """Role użytkowników w systemie"""
    SUPER_ADMIN = 0
    """Super administrator - może tworzyć i usuwać administratorów"""
    ADMIN = 1
    """Administrator systemu - może tworzyć i usuwać użytkowników"""
    USER = 2
    """Zwykły użytkownik - może tworzyć postaci"""

class User(SQLModel, table=True):
    """Model użytkownika"""
    id: int = Field(default=None, primary_key=True)
    """ID użytkownika"""
    username: Optional[str] = Field(default=None)
    """Nazwa użytkownika"""
    email: Optional[str] = Field(default=None)
    """Email użytkownika"""
    hashed_password: Optional[str] = Field(default=None)
    """Hasło użytkownika"""
    role_id: Optional[int] = Field(default=None, foreign_key="userrole.id")
    """Rola użytkownika"""
    generation_attempts: int = Field(default=0)
    """Liczba prób wygenerowania postaci"""
    characters: List["SavedCharacter"] = Relationship(back_populates="user")

class UserRole(SQLModel, table=True):
    """Model roli użytkownika"""
    id: int = Field(default=None, primary_key=True)
    """ID roli"""
    name: Optional[str] = Field(default=None)
    """Nazwa roli"""
    description: Optional[str] = Field(default=None)
    """Opis roli"""

class UserCreationToken(SQLModel, table=True):
    """Model tokenu tworzenia użytkownika"""
    id: str = Field(default=None, primary_key=True)
    """ID tokenu"""
    max_uses: Optional[int] = Field(default=None)
    """Maksymalna liczba użyć tokenu"""
    uses: Optional[int] = Field(default=None)
    """Liczba użyć tokenu"""
    expires_at: Optional[datetime] = Field(default=None)
    """Data wygaśnięcia tokenu"""
    
class Character(SQLModel, table=True):
    """Model postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID postaci"""
    user_id: int = Field(default=None, foreign_key="user.id")
    """ID użytkownika, do którego należy postać"""
    name: Optional[str] = Field(default=None)
    """Nazwa postaci"""
    description: Optional[str] = Field(default=None)
    """Opis postaci"""
    looks_description: Optional[str] = Field(default=None)
    """Opis wyglądu postaci"""
    image_url: Optional[str] = Field(default=None)
    """URL do obrazu postaci"""
    stat_spokoj: Optional[int] = Field(default=None)
    """Stan spokoju postaci"""
    stat_hart: Optional[int] = Field(default=None)
    """Stan serca postaci"""
    stat_urok: Optional[int] = Field(default=None)
    """Stan uroku postaci"""
    stat_spryt: Optional[int] = Field(default=None)
    """Stan sprytu postaci"""
    stat_dziw: Optional[int] = Field(default=None)
    """Stan dziwaczki postaci"""
    scars_clock: Optional[int] = Field(default=None)
    """Stan zegara ran postaci"""
    progress_check: Optional[int] = Field(default=None)
    """Stan rozwoju postaci (0-4)"""
    character_level: Optional[int] = Field(default=None)
    """Poziom postaci (domyślnie 1)"""
    created_at: Optional[datetime] = Field(default=None)
    """Data utworzenia postaci"""
    updated_at: Optional[datetime] = Field(default=None)
    """Data aktualizacji postaci"""
    
class DedicatedMove(SQLModel, table=True):
    """Model ruchu dodatkowego (akcji)"""
    id: int = Field(default=None, primary_key=True)
    """ID ruchu"""
    name: Optional[str] = Field(default=None)
    """Nazwa ruchu"""
    description: Optional[str] = Field(default=None)
    """Opis ruchu"""
    base_character_class_id: Optional[int] = Field(default=None, foreign_key="characterclass.id")
    """Domyślne Id klasy, do której należy ruch"""
    
class CharacterDedicatedMove(SQLModel, table=True):
    """Model ruchów, które należą do postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID ruchu"""
    character_id: int = Field(default=None, foreign_key="character.id")
    """ID postaci"""
    move_id: int = Field(default=None, foreign_key="dedicatedmove.id")
    """ID ruchu"""

class CharacterClass(SQLModel, table=True):
    """Model klasy postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID klasy postaci"""
    name: Optional[str] = Field(default=None)
    """Nazwa klasy postaci"""
    description: Optional[str] = Field(default=None)
    """Opis klasy postaci"""
    special_move: Optional[str] = Field(default=None)
    
class CharacterCharachterClass(SQLModel, table=True):
    """Model klas, do których należy postać"""
    id: int = Field(default=None, primary_key=True)
    """ID klasy postaci"""
    character_id: int = Field(default=None, foreign_key="character.id")
    """ID postaci"""
    character_class_id: int = Field(default=None, foreign_key="characterclass.id")
    """ID klasy postaci"""


class Item(SQLModel, table=True):
    """Model przedmiotu"""
    id: int = Field(default=None, primary_key=True)
    """ID przedmiotu"""
    name: Optional[str] = Field(default=None)
    """Nazwa przedmiotu"""
    description: Optional[str] = Field(default=None)
    """Opis przedmiotu"""
    is_consumable: Optional[bool] = Field(default=None)
    """Czy przedmiot jest spożywalny"""
    is_usable: Optional[bool] = Field(default=None)
    """Czy przedmiot jest użyteczny"""
    is_weapon: Optional[bool] = Field(default=None)
    """Czy przedmiot jest bronią"""
    is_armor: Optional[bool] = Field(default=None)
    """Czy przedmiot jest zbroją"""
    barter_value: Optional[int] = Field(default=None)
    """Wartość przedmiotu w barterze"""
    damage: Optional[int] = Field(default=None)
    """Obrażenia przedmiotu"""
    armor: Optional[int] = Field(default=None)
    """Obrona przedmiotu"""

class ItemAttribute(SQLModel, table=True):
    """Model atrybutów przedmiotu"""
    id: int = Field(default=None, primary_key=True)
    """ID atrybutu"""
    name: Optional[str] = Field(default=None)
    """Nazwa atrybutu"""
    description: Optional[str] = Field(default=None)
    """Opis atrybutu"""

class CharacterItem(SQLModel, table=True):
    """Model przedmiotów, które należą do postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID przedmiotu"""
    character_id: int = Field(default=None, foreign_key="character.id")
    """ID postaci"""
    item_id: int = Field(default=None, foreign_key="item.id")
    """ID przedmiotu"""
    

class CharacterItemItemAttribute(SQLModel, table=True):
    """Model atrybutów, które należą do przedmiotu postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID atrybutu"""
    character_item_id: int = Field(default=None, foreign_key="characteritem.id")
    """ID przedmiotu"""
    item_attribute_id: int = Field(default=None, foreign_key="itemattribute.id")
    """ID atrybutu"""

class SavedCharacter(SQLModel, table=True):
    """Model zapisanej postaci"""
    id: Optional[int] = Field(default=None, primary_key=True)
    """Identyfikator postaci"""
    user_id: int = Field(foreign_key="user.id")
    """Identyfikator użytkownika, który stworzył postać"""
    name: str = Field(index=True)
    """Nazwa postaci"""
    character_class: str
    """Klasa postaci"""
    stats: dict = Field(sa_column=Column(JSON), default={})
    """Statystyki postaci"""
    appearance: str
    """Wygląd postaci"""
    description: str
    """Opis postaci"""
    moves: List[dict] = Field(sa_column=Column(JSON), default=[])
    """Lista ruchów postaci"""
    equipment: List[dict] = Field(sa_column=Column(JSON), default=[])
    """Lista ekwipunku postaci"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    """Data utworzenia postaci"""
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    """Data ostatniej aktualizacji postaci"""

    # Relacja z użytkownikiem
    user: Optional["User"] = Relationship(back_populates="characters")
    # Relacja z obrazami
    images: List["CharacterImage"] = Relationship(back_populates="character", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

# Dodaj relację do klasy User
User.characters = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class CharacterImage(SQLModel, table=True):
    """Model obrazu postaci w bazie danych"""
    id: Optional[int] = Field(default=None, primary_key=True)
    """Identyfikator obrazu"""
    character_id: int = Field(foreign_key="savedcharacter.id")
    """Identyfikator postaci"""
    image_url: str
    """URL obrazu"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    """Data utworzenia"""
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    """Data aktualizacji"""

    # Relacja z SavedCharacter
    character: Optional["SavedCharacter"] = Relationship(back_populates="images")