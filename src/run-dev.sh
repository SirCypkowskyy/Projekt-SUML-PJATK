#!/bin/bash

# Sprawdź, czy .venv istnieje
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Aktywuj wirtualne środowisko
echo "Activating virtual environment..."
source .venv/bin/activate

# Zainstaluj zależności
echo "Installing dependencies..."
pip install -r ./backend-app/requirements.txt

# Uruchom aplikację FastAPI na porcie 2137 i aplikację kliencką Vite
echo "Starting FastAPI app on port 2137..."
fastapi run ./backend-app/main.py --port 2137 & echo $! > .pid &
cd ..
echo "Starting Vite app on port 3000..."
cd vite-client-suml && npm run dev & echo $! > ../.pid &
cd ..

# Zatrzymaj wszystkie procesy po naciśnięciu Ctrl+C
trap "kill -9 `cat .pid`" SIGINT

# Usuń plik .pid
rm -f .pid