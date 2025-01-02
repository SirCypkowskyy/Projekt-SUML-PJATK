# Test SPA React Py - Backend App

Część backendowa aplikacji Test SPA React Py.

## Uruchomamianie

Aplikacja może być uruchamiana lokalnie za pomocą komendy:

```bash
# Uruchomienie aplikacji lokalnie
fastapi run main.py --port 2137
```

W środowisku produkcyjnym uruchamia się za pomocą [docker-compose.yml](.../docker-compose.yml).

```bash
# Uruchomienie aplikacji w środowisku produkcyjnym
docker compose up -d
```

> [!NOTE]
> Aplikacja wymaga dodatkowego pliku konfiguracyjnego `.env` oraz `initial_data.json`, który nie jest dostępny w repozytorium, w ścieżce `~/sumlapp/.env` oraz `~/sumlapp/initial_data.json`. Dla uruchomienia aplikacji w środowisku produkcyjnym zamiast tego należy użyć pliku `.env` w katalogu backend-app aplikacji.

Przykładowy plik `.env`:

```bash
# Przykładowy plik .env
# Ustawienia bazy danych
DATABASE_URL=sqlite:///./data/db.sqlite
# Ustawienia OpenAI
OPENAI_API_KEY=
# Klucz sekretny dla aplikacji
SECRET_KEY=
# Tryb działania aplikacji
MODE=development
# Ustawienia CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
# Ustawienia bazowego admina
BASE_ADMIN_USERNAME=admin
BASE_ADMIN_EMAIL=admin@admin.com
BASE_ADMIN_PASSWORD=admin
```

Przykładowy plik `initial_data.json`:

```json
{
    "user_roles": [],
    "character_classes": [],
    "dedicated_moves": []
}
```

## Autorzy

- Cyprian Gburek
- Julia Bochen
- Oleksandr Zimenko
