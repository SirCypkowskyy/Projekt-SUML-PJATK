from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class User(Base):
    """
    Model dla użytkownika aplikacji.
    """
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)

class UserCreate(BaseModel):
    """
    Model do tworzenia nowego użytkownika.
    """
    username: str
    email: str
    full_name: str

class UserInDB(UserCreate):
    """
    Model użytkownika w bazie danych.
    """
    id: int

class UserUpdate(BaseModel):
    """
    Model do aktualizacji danych użytkownika.
    """
    email: str
    full_name: str

class UserResponse(BaseModel):
    """
    
    """
    username: str
    email: str
    full_name: str