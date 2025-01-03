from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from data.database import get_session
from helpers.auth_helper import AuthHelper

def get_db() -> Generator[Session, None, None]:
    """Database dependency"""
    yield from get_session()

def get_auth_helper(session: Session = Depends(get_db)) -> AuthHelper:
    """Returns AuthHelper instance with session"""
    return AuthHelper(session)