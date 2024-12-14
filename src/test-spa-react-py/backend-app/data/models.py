from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    """Model użytkownika"""
    id: int = Field(default=None, primary_key=True)
    """ID użytkownika"""
    username: str | None = Field(default=None)
    """Nazwa użytkownika"""
    email: str | None = Field(default=None)
    """Email użytkownika"""
    hashed_password: str | None = Field(default=None)
    """Hasło użytkownika"""
    role_id: int = Field(default=None, foreign_key="userrole.id")
    """Rola użytkownika"""

class UserRole(SQLModel, table=True):
    """Model roli użytkownika"""
    id: int = Field(default=None, primary_key=True)
    """ID roli"""
    name: str | None = Field(default=None)
    """Nazwa roli"""
    description: str | None = Field(default=None)
    """Opis roli"""

class UserCreationToken(SQLModel, table=True):
    """Model tokenu tworzenia użytkownika"""
    id: str = Field(default=None, primary_key=True)
    """ID tokenu"""
    max_uses: int | None = Field(default=None)
    """Maksymalna liczba użyć tokenu"""
    uses: int | None = Field(default=None)
    """Liczba użyć tokenu"""
    expires_at: datetime | None = Field(default=None)
    """Data wygaśnięcia tokenu"""
    
class Character(SQLModel, table=True):
    """Model postaci"""
    id: int = Field(default=None, primary_key=True)
    """ID postaci"""
    name: str | None = Field(default=None)
    """Nazwa postaci"""
    description: str | None = Field(default=None)
    """Opis postaci"""
    looks_description: str | None = Field(default=None)
    """Opis wyglądu postaci"""
    image_url: str | None = Field(default=None)
    """URL do obrazu postaci"""
    stat_spokoj: int | None = Field(default=None)
    """Stan spokoju postaci"""
    stat_hart: int | None = Field(default=None)
    """Stan serca postaci"""
    stat_urok: int | None = Field(default=None)
    """Stan uroku postaci"""
    stat_spryt: int | None = Field(default=None)
    """Stan sprytu postaci"""
    stat_dziw: int | None = Field(default=None)
    """Stan dziwaczki postaci"""
    scars_clock: int | None = Field(default=None)
    """Stan zegara ran postaci"""
    progress_check: int | None = Field(default=None)
    """Stan rozwoju postaci (0-4)"""
    character_level: int | None = Field(default=None)
    """Poziom postaci (domyślnie 1)"""
    created_at: datetime | None = Field(default=None)
    """Data utworzenia postaci"""
    updated_at: datetime | None = Field(default=None)
    """Data aktualizacji postaci"""
    
class DedicatedMove(SQLModel, table=True):
    """Model ruchu dodatkowego (akcji)"""
    id: int = Field(default=None, primary_key=True)
    """ID ruchu"""
    name: str | None = Field(default=None)
    """Nazwa ruchu"""
    description: str | None = Field(default=None)
    """Opis ruchu"""
    base_character_class_id: int | None = Field(default=None, foreign_key="characterclass.id")
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
    name: str | None = Field(default=None)
    """Nazwa klasy postaci"""
    description: str | None = Field(default=None)
    """Opis klasy postaci"""
    special_move: str | None = Field(default=None)
    
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
    name: str | None = Field(default=None)
    """Nazwa przedmiotu"""
    description: str | None = Field(default=None)
    """Opis przedmiotu"""
    is_consumable: bool | None = Field(default=None)
    """Czy przedmiot jest spożywalny"""
    is_usable: bool | None = Field(default=None)
    """Czy przedmiot jest użyteczny"""
    is_weapon: bool | None = Field(default=None)
    """Czy przedmiot jest bronią"""
    is_armor: bool | None = Field(default=None)
    """Czy przedmiot jest zbroją"""
    barter_value: int | None = Field(default=None)
    """Wartość przedmiotu w barterze"""
    damage: int | None = Field(default=None)
    """Obrażenia przedmiotu"""
    armor: int | None = Field(default=None)
    """Obrona przedmiotu"""

class ItemAttribute(SQLModel, table=True):
    """Model atrybutów przedmiotu"""
    id: int = Field(default=None, primary_key=True)
    """ID atrybutu"""
    name: str | None = Field(default=None)
    """Nazwa atrybutu"""
    description: str | None = Field(default=None)
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