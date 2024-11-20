import sqlite3
from pathlib import Path

class DBManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        """Implementacja wzorca Singleton."""
        if not cls._instance:
            cls._instance = super(DBManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, db_path="database/app_data.db"):
        if not hasattr(self, 'initialized'):
            self.db_path = Path(db_path)
            self.initialize_db()
            self.initialized = True

    def initialize_db(self):
        """Inicjalizuje bazę danych i tworzy tabele, jeśli nie istnieją."""
        with self.get_connection() as conn:
            c = conn.cursor()
            # Tworzenie tabeli użytkowników
            c.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL
                )
            ''')
            # Tworzenie tabeli kart postaci
            c.execute('''
                CREATE TABLE IF NOT EXISTS characters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT,
                    character_name TEXT,
                    race TEXT,
                    class TEXT,
                    attributes TEXT
                )
            ''')

    def get_connection(self):
        """Zwraca połączenie do bazy danych."""
        return sqlite3.connect(self.db_path)

    def add_user(self, username, password):
        """Dodaje nowego użytkownika do bazy danych."""
        with self.get_connection() as conn:
            c = conn.cursor()
            try:
                c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
                conn.commit()
                return True
            except sqlite3.IntegrityError:
                return False

    def get_user(self, username):
        """Pobiera dane użytkownika na podstawie nazwy użytkownika."""
        with self.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE username = ?", (username,))
            return c.fetchone()

    def add_character(self, username, character_name, race, char_class, attributes):
        """Dodaje nową kartę postaci do bazy danych."""
        with self.get_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO characters (username, character_name, race, class, attributes) VALUES (?, ?, ?, ?, ?)",
                      (username, character_name, race, char_class, attributes))
            conn.commit()

    def get_characters_by_user(self, username):
        """Pobiera karty postaci użytkownika na podstawie nazwy użytkownika."""
        with self.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM characters WHERE username = ?", (username,))
            return c.fetchall()