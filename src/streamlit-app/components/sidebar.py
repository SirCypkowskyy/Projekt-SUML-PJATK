import streamlit as st


def sidebar_component():
    st.sidebar.title("Menu")
    
    if st.session_state['logged_in']:
        st.sidebar.write("Zalogowany jako:")
        st.sidebar.write(st.session_state['logged_in'])
        st.sidebar.button("Wyloguj", key="logout_button")
        
    else:
        st.sidebar.page_link('pages/7_Login.py', label='Logowanie')
        # st.sidebar.button("Zaloguj", key="login_button")
        # Nawigacja
        # st.sidebar.subheader("Nawigacja")
        # st.sidebar.page_link("App", "Strona główna")
        # st.sidebar.page_link("Rozpocznij_tworzenie_postaci", "Rozpocznij tworzenie postaci")
    