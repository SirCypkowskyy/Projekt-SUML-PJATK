# Projekt SUML - Przewodnik Apokalipsy

Asystent do interaktywnego tworzenia kart postaci do klasycznego papierowego RPGa "Świat Apokalipsy" (ang. *Apocalypse World*).

## Autorzy
- Julia Bochen (s25106)
- Cyprian Gburek (s24759)
- Oleksandr Zimenko (s24982)

## O Projekcie

*Przewodnik Apokalipsy* to zaawansowane narzędzie wykorzystujące sztuczną inteligencję do tworzenia kart postaci w systemie RPG "Apocalypse World". Aplikacja przeprowadza użytkownika przez spersonalizowany, interaktywny proces kreacji bohatera, zastępując tradycyjne wypełnianie formularzy inteligentnym dialogiem z asystentem AI.

### Główne Funkcjonalności

- **Interaktywny Kreator Postaci**
  - Kontekstowe pytania generowane przez AI
  - Inteligentny dobór klasy postaci
  - Automatyczne generowanie statystyk i cech
  - Generowanie wizualizacji postaci przy użyciu DALL-E 3

- **System Zarządzania Postaciami**
  - Zapisywanie i edycja stworzonych postaci
  - Przeglądanie historii kreacji
  - Eksport kart postaci

### Architektura Systemu

#### Frontend (React + TypeScript + Vite.js)
- Nowoczesny, responsywny interfejs użytkownika
- Komponenty UI zbudowane przy użyciu biblioteki shadcn/ui
- Routing oparty na Tanstack Router
- Zarządzanie stanem aplikacji przy użyciu React Query

#### Backend (FastAPI + Python)
- REST API do komunikacji z frontendem
- Integracja z modelami AI poprzez LangGraph
- System autoryzacji i uwierzytelniania użytkowników
- Integracja z bazą danych SQLite

#### Modele AI
- LangChain z GPT-4
- System generowania kontekstowych pytań
- Wektorowa baza danych Chroma do doboru klas postaci
- Integracja z DALL-E 3 do generowania wizualizacji

### Technologie

- **Frontend:**
  - TypeScript
  - React
  - Vite.js
  - TailwindCSS
  - shadcn/ui

- **Backend:**
  - Python
  - FastAPI
  - SQLite
  - LangChain
  - LangGraph

- **Konteneryzacja:**
  - Docker
  - Docker Compose

### Uruchomienie Projektu

1. Sklonuj repozytorium:
```bash
git clone https://github.com/your-username/Projekt-SUML-PJATK.git
cd Projekt-SUML-PJATK
```

2. Uzupełnij plik .env.prod o odpowiednie zmienne środowiskowe
```bash
touch .env.prod
```

Przykładowe zmienne środowiskowe:
```
SECRET_KEY=...
MODE_STR=...
MODE=...
BACKEND_CORS_ORIGINS=...
BASE_ADMIN_USERNAME=...
BASE_ADMIN_EMAIL=...
BASE_ADMIN_PASSWORD=...
PROJECT_NAME=...
PROJECT_VERSION=...
PROJECT_DESCRIPTION=...

OPENAI_API_KEY=...
LANGCHAIN_TRACING_V2=...
LANGCHAIN_ENDPOINT=...
LANGCHAIN_API_KEY=...
LANGCHAIN_PROJECT=...
```


3. Uruchom aplikację używając Docker Compose:
```bash
docker compose --env-file .env.prod up -d
```

3. Aplikacja będzie dostępna pod adresami:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Dokumentacja API: http://localhost:8000/docs

## TODO

### Deployment
- [x] Naprawa docker-compose by dało się uruchomić łatwo aplikację
- [x] Zaserwowanie najnowszej wersji aplikacji na serwerze

### Klient
- [x] Dodanie podstawowej infrastruktury
    - [x] Konfiguracja routingu
    - [x] Konfiguracja state managementu
    - [x] Dodanie podstawowych komponentów UI (przyciski, inputy, karty)
- [x] System autoryzacji
    - [x] Dodanie strony logowania
    - [x] Dodanie strony rejestracji
    - [x] Dodanie strony profilu użytkownika
    - [x] Implementacja persystencji sesji
    - [ ] Dodanie strony resetowania hasła
- [x] Dashboard użytkownika
    - [x] Lista zapisanych postaci
    - [x] Możliwość edycji/usuwania postaci
    - [ ] Filtrowanie i sortowanie postaci
- [x] Kreator postaci
    - [x] Interfejs do interakcji z AI (czat/formularz)
    - [x] Podgląd generowanej karty postaci
    - [x] Edytor statystyk i umiejętności
    - [x] System zapisywania postaci w trakcie tworzenia

### Serwer
- [x] Konfiguracja bazy danych
    - [x] Model użytkownika
    - [x] Model postaci
    - [ ] Model sesji
- [x] System autoryzacji
    - [x] Implementacja JWT
    - [x] Endpointy autoryzacyjne
- [x] Integracja z AI
    - [x] Konfiguracja LangChain
    - [x] Integracja LangChain z OpenAI
    - [x] Integracja LangChain z FastAPI
- [ ] Dodanie rate-limitingu dla endpointów, które mogą być używane przez klienta
- [ ] Generowanie PDF
    - [ ] Szablon karty postaci
    - [ ] System dynamicznego wypełniania szablonu
    - [ ] Możliwość eksportu do edytowalnego formatu
- [x] (nieobowiązkowe) Generacja wizerunku postaci
    - [x] Generacja wizerunku postaci na podstawie odpowiedzi użytkownika przez AI (DallE)
    - [ ] Dodanie możliwości edycji wizerunku postaci przez użytkownika (dodanie nowych pytań dla użytkownika, dotyczących wizerunku postaci)
- [ ] Dodanie lepszego loggingu dla endpointów
- [ ] Dokumentacja API
    - [ ] Specyfikacja OpenAPI
    - [ ] Przykłady użycia
    - [ ] Dokumentacja deploymentu
