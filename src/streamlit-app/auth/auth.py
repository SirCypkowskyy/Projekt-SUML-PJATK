from database.db_manager import DBManager
from .jwt_handler import create_token, set_cookie, delete_cookie

# Inicjalizacja instancji DBManager
db_manager = DBManager()

def register(username, password):
    """Rejestruje nowego użytkownika, zwraca True, jeśli sukces, False, jeśli nazwa już istnieje."""
    return db_manager.add_user(username, password)

def login(username, password):
    """Loguje użytkownika, jeśli dane są poprawne. Ustala ciasteczko z tokenem."""
    user = db_manager.get_user(username)
    if user and user[1] == password:
        token = create_token(username)
        set_cookie(token)
        return True
    return False

def logout():
    """Wylogowuje użytkownika, usuwając ciasteczko."""
    delete_cookie()