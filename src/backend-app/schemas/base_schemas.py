from pydantic import BaseModel

class PaginatedResponse(BaseModel):
    """Bazowy model odpowiedzi z paginacją"""
    total: int
    """Liczba wszystkich elementów"""
    page: int
    """Numer strony"""
    per_page: int
    """Liczba elementów na stronie"""
    total_pages: int
    """Liczba wszystkich stron"""