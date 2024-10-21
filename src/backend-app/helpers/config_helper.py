import os
from dotenv import load_dotenv

load_dotenv()

class ConfigHelper():
    """
    Klasa pomocnicza do obsługi konfiguracji aplikacji.
    """
    
    @staticmethod
    def get_env_var_or_raise(env_var_name: str) -> str:
        """
        Metoda do pobierania wartości zmiennej środowiskowej.
        Jeżeli zmienna nie istnieje, metoda rzuca wyjątek.     
        
            :param env_var_name: Nazwa zmiennej środowiskowej.
            :type env_var_name: str
            :return: Wartość zmiennej środowiskowej.
            :rtype: str
        """
        result = os.getenv(env_var_name)
        if result is None or result == "":
            raise ValueError(f"Zmienna środowiskowa {env_var_name} nie istnieje lub jest pusta.")
        
        return result