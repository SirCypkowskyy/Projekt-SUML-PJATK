import jwt
import datetime
import streamlit as st
from settings import settings

def create_token(username):
    """Tworzy token JWT dla użytkownika."""
    expiration = datetime.datetime.now() + datetime.timedelta(hours=1)  # Ważność tokenu na 1 godzinę
    token = jwt.encode({'username': username, 'exp': expiration}, settings.SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    """Dekoduje token JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload['username']
    except Exception as e:
        return None  # Token jest nieprawidłowy

def set_cookie(token):
    """Ustala ciasteczko z tokenem."""
    st.session_state['cookie'] = token

def get_cookie():
    """Zwraca token z ciasteczka, jeśli istnieje."""
    return st.session_state.get('cookie', None)

def delete_cookie():
    """Usuwa ciasteczko."""
    st.session_state['cookie'] = None