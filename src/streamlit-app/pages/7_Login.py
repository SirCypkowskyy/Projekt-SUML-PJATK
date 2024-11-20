# pages/7_Login.py
import streamlit as st

def login():
    st.title("Logowanie")

    username = st.text_input("Nazwa użytkownika")
    password = st.text_input("Hasło", type="password")

    if st.button("Zaloguj się"):
        if not username or not password:
            st.error("Proszę wypełnić wszystkie pola.")
        else:
            valid = True
            if valid:
                st.session_state['logged_in'] = True
                st.session_state['username'] = username
                st.success(f"Zalogowano jako {username}.")
                st.experimental_rerun()  # Odświeża stronę do aktualizacji stanu
            else:
                st.error("Nieprawidłowa nazwa użytkownika lub hasło.")

if __name__ == "__main__":
    login()