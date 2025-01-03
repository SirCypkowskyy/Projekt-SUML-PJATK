from fastapi import APIRouter
from api.v1.endpoints import core, auth

api_router = APIRouter()
api_router.include_router(core.router, prefix="/core", tags=["core"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])