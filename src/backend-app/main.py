from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from data.database import create_tables
from data.seed import seed_database 
from core.config import settings
from api.v1.api import api_router
from middleware.logging_middleware import logging_middleware
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    # openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # docs_url=f"{settings.API_V1_STR}/docs",
    # redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Dodanie middleware'a logowania przed innymi middleware'ami
app.middleware("http")(logging_middleware)

@app.middleware("http")
async def add_auth_middleware(request: Request, call_next):
    """Dodaje middleware autoryzacji do aplikacji

    Args:
        request (Request): Zapytanie HTTP
        call_next (_type_): Funkcja do wywołania następnego middleware'a

    Returns:
        Response: Odpowiedź HTTP
    """
    response = await call_next(request)
    # Dodaj nagłówki bezpieczeństwa dla ciasteczek
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/api/data")
def get_data():
    return {"data": "Hello World"}
