import os
from dotenv import load_dotenv
from fastapi import FastAPI
from route.auth import auth_router
from route.ai import ai_router
from route.cruds.user_cruds import users_crud_router
import uvicorn

load_dotenv()

tags = [
    {
        "name": "auth",
        "description": "Endpointy do obsługi autoryzacji użytkowników."
    },
    {
        "name": "ai",
        "description": "Endpointy do obsługi serwisów ML/AI."
    },
    {
        "name": "health",
        "description": "Endpointy do sprawdzania stanu aplikacji."
    },
    {
        "name": "openai",
        "description": "Endpointy do obsługi serwisów OpenAI."
    },
    {
        "name": "users",
        "description": "Endpointy do obsługi użytkowników."
    }
]

app = FastAPI(
    title="SUML Aplikacja Backendowa WebAPI",
    description="Aplikacja backendowa do obsługi serwisów ML/AI na potrzeby projektu z przedmiotu SUML",
    version="0.1.0",
    contact= {
        "name": "SUML 17c - Cyprian Gburek, Oleksandr Zimenko, Julia Bochen",
        "email": "s24759@pjwstk.edu.pl"
    },
    openapi_tags=tags
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(users_crud_router, prefix="/users", tags=["users"])

if __name__ == "__main__":
    if os.environ.get('RUNNING_IN_CONTAINER'):
        uvicorn.run('main:app', host="0.0.0.0", port=80, log_config=None)
    else:
        uvicorn.run('main:app', host="127.0.0.1", port=3000, log_config=None)