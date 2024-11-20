import streamlit as st
from auth.auth import login, register, logout
from auth.jwt_handler import decode_token
from components.sidebar import sidebar_component
from database.db_manager import DBManager
import importlib

# Jedyna instancja DBManager
db_manager = DBManager()

# Inicjalizacja sesji
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False

# Sprawdzenie autoryzacji na początku
username = decode_token(st.session_state.get('cookie', None))
if username:
    st.session_state['logged_in'] = username

# Ustawienia strony
st.set_page_config(
    page_title="Strona główna",
    page_icon="👋",
    layout="centered",
    initial_sidebar_state="expanded",
)

# Tytuł i podtytuł
st.title("Przewodnik Apokalipsy")
st.markdown(
    """
    ## Witaj w **Przewodniku Apokalipsy**!
    Nasz asystent pomoże Ci w łatwy i przyjemny sposób stworzyć oraz wypełnić kartę postaci do gry RPG **Świat Apokalipsy**. Dzięki interaktywnym pytaniom w klimacie fabularnym, proces tworzenia postaci staje się immersyjny i angażujący.
    ### **Funkcje aplikacji:**
    - **Interaktywne pytania:** Przewodnik prowadzi Cię krok po kroku przez proces tworzenia postaci.
    - **Personalizacja:** Dostosuj każdą cechę swojej postaci zgodnie z własnymi preferencjami.
    - **Generowanie PDF:** Po ukończeniu, pobierz wypełnioną kartę postaci w formacie PDF.
    - **Przechowywanie danych:** Zachowaj swoje postacie i wracaj do nich w dowolnym momencie.
    ### **Jak zacząć?**
    1. Kliknij przycisk poniżej, aby rozpocząć tworzenie nowej postaci.
    2. Odpowiadaj na zadawane pytania, rozwijając historię i cechy swojej postaci.
    3. Po zakończeniu, pobierz gotową kartę postaci i gotowe – jesteś gotowy do gry!
    ![Świat Apokalipsy](https://example.com/apocalypse_world_image.jpg)
    **Rozpocznij swoją przygodę już teraz!**
    """
)
st.button("Rozpocznij tworzenie postaci", key="start_button")
# Informacje dodatkowe (opcjonalne)
st.markdown(
    """
    ---
    **Wsparcie:** Jeśli potrzebujesz pomocy, odwiedź sekcję [Instrukcja](2_Instrukcja) lub skontaktuj się z nami [tutaj](3_Kontakt).
    **Świat Apokalipsy** to gra RPG stworzona przez pasjonatów. Cieszymy się, że możemy Cię wspierać w tworzeniu Twojej postaci!
    © 2024 Przewodnik Apokalipsy. SUML PJATK.
    """
)

sidebar_component()

if st.session_state['logged_in']:
    st.subheader(f"Zalogowany jako: {st.session_state['logged_in']}")
else:
    st.subheader('Nie jesteś zalogowany.')
    st.write("[Zaloguj się](Login), aby móc korzystać z dodatkowych funkcji aplikacji.")
    st.write("Jeśli nie masz konta, [zarejestruj się](Rejestracja).")
    st.write("Jeśli zapomniałeś hasła, zresetuj je.")
    