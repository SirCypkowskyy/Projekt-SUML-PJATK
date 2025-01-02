from fastapi import Request
from typing import Callable
import logging
from datetime import datetime
from helpers.auth_helper import AuthHelper
from data.database import get_session

# Konfiguracja podstawowego loggera
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next: Callable):
    """Middleware do logowania szczegółów żądań"""
    start_time = datetime.now()
    
    # Pobierz IP klienta
    client_ip = request.client.host if request.client else "unknown"
    
    # Próba pobrania ID zalogowanego użytkownika
    user_id = "niezalogowany"
    session = None
    try:
        session = next(get_session())
        auth_helper = AuthHelper(session)
        access_token = request.cookies.get("access_token")
        if access_token:
            user_id = auth_helper.verify_token(access_token, "access")
    except Exception as e:
        logger.error(f"Błąd auth: {str(e)}")
    finally:
        if session:
            session.close()
    
    # Log żądania
    logger.info(
        f"→ {request.method} {request.url.path} | "
        f"IP: {client_ip} | "
        f"User: {user_id} | "
        f"Params: {dict(request.query_params)}"
    )
    
    # Wykonanie żądania
    response = await call_next(request)
    
    # Obliczenie czasu wykonania
    process_time = (datetime.now() - start_time).total_seconds()
    
    # Log odpowiedzi
    logger.info(
        f"← {request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Time: {process_time:.3f}s | "
        f"User: {user_id}"
    )
    
    return response