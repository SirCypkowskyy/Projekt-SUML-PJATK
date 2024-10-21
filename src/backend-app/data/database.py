from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
from helpers.config_helper import ConfigHelper

DB_USER= ConfigHelper.get_env_var_or_raise("DB_USER")
DB_PASSWORD= ConfigHelper.get_env_var_or_raise("DB_PASSWORD")
DB_HOST= ConfigHelper.get_env_var_or_raise("DB_HOST")
DB_PORT= ConfigHelper.get_env_var_or_raise("DB_PORT")
DB_NAME= ConfigHelper.get_env_var_or_raise("DB_NAME")

class AsyncDatabaseSession:
    def __init__(self):
        self._session = None
        self._engine = None
    def __getattr__(self, name):
            return getattr(self._session, name)
    def init(self):
            self._engine = create_async_engine(
                f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
                future=True,
                echo=True,
            )
            self._session = sessionmaker(
                self._engine, expire_on_commit=False, class_=AsyncSession
            )()
    async def get_session(self):
        """
        Wrapper do uzyskania sesji z bazą danych. Używany jako zależność w endpointach.
        """
        async with self._session() as session:
             yield session
    async def create_all(self):
        self._engine.begin

db=AsyncDatabaseSession()
