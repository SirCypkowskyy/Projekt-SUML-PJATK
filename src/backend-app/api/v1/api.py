"""
Skrypt w którym tworzymy routery dla grup endpointów
"""
from fastapi import APIRouter
from api.v1.endpoints import core, auth, character_gen_endpoints

api_router = APIRouter()
api_router.include_router(core.core_router, prefix="/core", tags=["core"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(character_gen_endpoints.router, prefix="/character-gen", tags=["character-gen"])