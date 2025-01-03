# Projekt-SUML-PJATK
 Projekt aplikacji-asystenta do tworzenia kart postaci do gier RPG, w ramach przedmiotu SUML na PJATK


## TODO

### Deployment
- [ ] Naprawa docker-compose by dało się uruchomić łatwo aplikację
- [ ] Zaserwowanie najnowszej wersji aplikacji na serwerze

### Klient
- [x] Dodanie podstawowej infrastruktury
    - [x] Konfiguracja routingu
    - [x] Konfiguracja state managementu
    - [x] Dodanie podstawowych komponentów UI (przyciski, inputy, karty)
- [ ] System autoryzacji
    - [ ] Dodanie strony logowania
    - [ ] Dodanie strony rejestracji
    - [ ] Dodanie strony resetowania hasła
    - [ ] Dodanie strony profilu użytkownika
    - [ ] Implementacja persystencji sesji
- [ ] Dashboard użytkownika
    - [ ] Lista zapisanych postaci
    - [ ] Możliwość edycji/usuwania postaci
    - [ ] Filtrowanie i sortowanie postaci
- [ ] Kreator postaci
    - [ ] Interfejs do interakcji z AI (czat/formularz)
    - [ ] Podgląd generowanej karty postaci
    - [ ] Edytor statystyk i umiejętności
    - [ ] System zapisywania postaci w trakcie tworzenia

### Serwer
- [x] Konfiguracja bazy danych
    - [x] Model użytkownika
    - [x] Model postaci
    - [ ] Model sesji
- [x] System autoryzacji
    - [x] Implementacja JWT
    - [x] Endpointy autoryzacyjne
- [ ] Integracja z AI
    - [ ] Konfiguracja LangChain
    - [ ] Prompt engineering dla generowania pytań
    - [ ] Prompt engineering dla generowania opisów
    - [ ] Prompt engineering dla sugerowania klasy postaci, cech, ruchów (umiejętności), itd.
- [ ] Dodanie rate-limitingu dla endpointów, które mogą być używane przez klienta
- [ ] Generowanie PDF
    - [ ] Szablon karty postaci
    - [ ] System dynamicznego wypełniania szablonu
    - [ ] Możliwość eksportu do edytowalnego formatu
- [ ] Dodanie lepszego loggingu dla endpointów
- [ ] (nieobowiązkowe) Generacja wizerunku postaci
    - [ ] Generacja wizerunku postaci na podstawie odpowiedzi użytkownika przez AI (DallE)
    - [ ] Dodanie możliwości edycji wizerunku postaci przez użytkownika (dodanie nowych pytań dla użytkownika, dotyczących wizerunku postaci)
- [ ] Dokumentacja API
    - [ ] Specyfikacja OpenAPI
    - [ ] Przykłady użycia
    - [ ] Dokumentacja deploymentu
