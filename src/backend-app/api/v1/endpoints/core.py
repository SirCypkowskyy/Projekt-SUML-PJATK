from fastapi import APIRouter

core_router = APIRouter()

@core_router.get("/")
def root():
    return {"message": "Hello World"}