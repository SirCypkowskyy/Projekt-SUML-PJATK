"""Moduł zawierający funkcje i zmienne do obsługi bazy danych

Opracowany na podstawie: https://fastapi.tiangolo.com/tutorial/sql-databases/
"""
from typing import Annotated
from core.config import settings
from sqlmodel import SQLModel, Session, create_engine
from fastapi import Depends

database_file_name = settings.SQLITE_FILE_NAME
sqlite_url = f"sqlite:///{database_file_name}"

# Create engine with connect args for SQLite
engine = create_engine(
    sqlite_url,
    connect_args={"check_same_thread": False},
    echo=True
)

def create_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]