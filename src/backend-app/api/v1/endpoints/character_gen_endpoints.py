from typing import Annotated, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, Cookie
from pydantic import BaseModel
from enum import Enum
from helpers.auth_helper import AuthHelper
from deps import get_auth_helper
from data.models import UserRoleEnum
from api.v1.endpoints.auth import ACCESS_TOKEN_COOKIE

router = APIRouter()

# Modele Pydantic


class Move(BaseModel):
    """Ruch postaci"""
    name: str
    """Nazwa ruchu"""
    description: str
    """Opis ruchu"""


class Equipment(BaseModel):
    """Ekwipunek postaci"""
    name: str
    """Nazwa ekwipunku"""
    description: str
    """Opis ekwipunku"""
    isRemovable: bool = False
    """Czy ekwipunek można zdjąć"""
    isWeapon: bool = False
    """Czy ekwipunek jest bronią"""
    options: Optional[List[Dict[str, str]]] = None
    """Opcje ekwipunku"""


class Stats(BaseModel):
    """Statystyki postaci"""
    cool: int
    """Statystyka 'spokoju' postaci"""
    hard: int
    """Statystyka 'hartu' postaci"""
    hot: int
    """Statystyka 'uroku' postaci"""
    sharp: int
    """Statystyka 'ostrożności' postaci"""
    weird: int
    """Statystyka 'dziwu' postaci"""


class GeneratedCharacter(BaseModel):
    """Wygenerowana postać"""
    name: str
    """Nazwa wygenerowanej postaci"""
    characterClass: str
    """Klasa wygenerowanej postaci"""
    stats: Stats
    """Statystyki wygenerowanej postaci"""
    appearance: str
    """Opis wyglądu wygenerowanej postaci"""
    description: str
    """Opis wygenerowanej postaci"""
    moves: List[Move]
    """Lista ruchów wygenerowanej postaci"""
    equipment: List[Equipment]
    """Lista elementów ekwipunku wygenerowanej postaci"""


class InitialInfo(BaseModel):
    """Informacje początkowe o postaci przy jej generowaniu"""
    characterBasics: str
    """Opis postaci"""
    characterBackground: str
    """Opis tła postaci"""
    characterTraits: str
    """Opis cech postaci"""
    worldDescription: str
    """Opis świata"""


class Question(BaseModel):
    """Pytanie"""
    text: str
    """Treść pytania"""
    type: str
    """Typ pytania"""
    options: Optional[List[str]] = None
    """Opcje pytania"""


class QuestionAnswers(BaseModel):
    """Odpowiedzi na pytania"""
    answers: Dict[str, str]
    """Kolekcja id - odpowiedź"""

# Dodaj enum dla klas postaci


class CharacterClass(str, Enum):
    MECHANIK = "Mechanik"
    ANIOL = "Anioł"
    CHOPPER = "Chopper"
    EGZEKUTOR = "Egzekutor"
    GUBERNATOR = "Gubernator"
    GURU = "Guru"
    KIEROWCA = "Kierowca"
    MUZA = "Muza"
    OPERATOR = "Operator"
    PSYCHOL = "Psychol"
    TEKKNIK = "Tekknik"
    ZYLETA = "Żyleta"

# Endpointy


@router.get("/moves/{character_class}", response_model=List[Move])
async def get_available_moves(
    character_class: CharacterClass, 
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth_helper: AuthHelper = Depends(get_auth_helper)
) -> List[Move]:
    """
    Pobiera dostępne ruchy dla danej klasy postaci.
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)
    moves_dict = {
        CharacterClass.MECHANIK: [
            Move(
                name="Majsterkowicz",
                description="Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3, na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu."
            )
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in moves_dict:
        raise HTTPException(
            status_code=404, detail="Klasa postaci nie znaleziona")

    return moves_dict[character_class]


@router.get("/equipment/{character_class}", response_model=List[Equipment])
async def get_base_equipment(character_class: CharacterClass,
                              access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None, auth_helper: AuthHelper = Depends(get_auth_helper)) -> List[Equipment]:
    """
    Pobiera podstawowy ekwipunek dla danej klasy postaci.
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)

    equipment_dict = {
        CharacterClass.MECHANIK: [
            Equipment(
                name="Skórzany kombinezon",
                description="1-pancerz",
                isRemovable=False
            )
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in equipment_dict:
        raise HTTPException(
            status_code=404, detail="Klasa postaci nie znaleziona")

    return equipment_dict[character_class]


@router.get("/weapons/{character_class}", response_model=List[Equipment])
async def get_available_weapons(character_class: CharacterClass,
                                  access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None, auth_helper: AuthHelper = Depends(get_auth_helper)) -> List[Equipment]:
    """
    Pobiera dostępne bronie dla danej klasy postaci.
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)

    weapons_dict = {
        CharacterClass.MECHANIK: [
            Equipment(
                name="klucz francuski",
                description="2-rany, ramię",
                isRemovable=True,
                isWeapon=True,
                options=[{"name": "wzmocniony", "effect": "+1rana"}]
            )
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in weapons_dict:
        raise HTTPException(
            status_code=404, detail="Klasa postaci nie znaleziona")

    return weapons_dict[character_class]


@router.get("/class-description/{character_class}", response_model=Dict[str, str])
async def get_class_description(character_class: CharacterClass,
                                access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None, auth_helper: AuthHelper = Depends(get_auth_helper)) -> Dict[str, str]:
    """
    Pobiera opis klasy postaci.
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)
    descriptions = {
        CharacterClass.ANIOL: "Leżysz w piachu Świata Apokalipsy, z akami na wierzchu...",
        CharacterClass.CHOPPER: "Świat Apokalipsy to niedobór wszystkiego, wiesz jak jest...",
        CharacterClass.EGZEKUTOR: "Świat Apokalipsy jest podły, ohydny i pełen przemocy...",
        CharacterClass.GUBERNATOR: "W Świecie Apokalipsy nie istnieje rząd ani zorganizowane społeczeństwo...",
        CharacterClass.GURU: "Teraz powinno być już jasne jak słońce, że bogowie opuścili Świat Apokalipsy...",
        CharacterClass.KIEROWCA: "Wraz z nadejściem apokalipsy nastąpił rozpad infrastruktury złotej ery...",
        CharacterClass.MUZA: "Nawet w plugawym Świecie Apokalipsy istnieje jedzenie...",
        CharacterClass.OPERATOR: "W Świecie Apokalipsy musisz pracować z tym, co masz pod ręką, prawda?...",
        CharacterClass.PSYCHOL: "Psychole są najbardziej popierdolonymi psychicznymi mózgojebami w Świecie Apokalipsy...",
        CharacterClass.TEKKNIK: "Jest jedna rzecz, na którą zawsze można liczyć w Świecie Apokalipsy: wszystko się psuje.",
        CharacterClass.ZYLETA: "Nawet w tak niebezpiecznym miejscu jak Świat Apokalipsy, żylety są, cóż...",
        CharacterClass.MECHANIK: "Mechanik to człowiek, który zna się na sprzęcie. Nie zna się na sprzęcie? To nie jest mechanik."
    }

    if character_class not in descriptions:
        raise HTTPException(
            status_code=404, detail="Klasa postaci nie znaleziona")

    return {"description": descriptions[character_class]}


@router.post("/generate", response_model=GeneratedCharacter)
async def generate_character(
    initial_info: InitialInfo,
    character_class: CharacterClass,
    questions: List[Question],
    answers: Dict[str, str],
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None, auth_helper: AuthHelper = Depends(get_auth_helper)
) -> GeneratedCharacter:
    """
    Generuje postać na podstawie podanych informacji.
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth_helper.verify_token(access_token, "access")
    print(f"Generating character with: {initial_info}, {character_class}, {questions}, {answers}")

    # Pobierz ruchy i ekwipunek dla danej klasy
    moves = await get_available_moves(character_class)
    equipment = await get_base_equipment(character_class)

    return GeneratedCharacter(
        name="John Doe",
        characterClass=character_class,
        stats=Stats(cool=1, hard=1, hot=1, sharp=1, weird=1),
        appearance="Chudy chłopak ze wsi",
        description="John Doe",
        moves=moves,
        equipment=equipment
    )


@router.post("/questions", response_model=List[Question])
async def fetch_creation_questions(initial_info: InitialInfo,
                                   access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None, auth_helper: AuthHelper = Depends(get_auth_helper)) -> List[Question]:
    """
    Pobiera pytania do tworzenia postaci na podstawie informacji początkowych.
    :param initial_info: Informacje początkowe o postaci przy jej generowaniu
    :return: Lista pytań
    """
    auth_helper.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth_helper.verify_token(access_token, "access")
    print(f"fetching questions with initialInfo: {initial_info}")
    try:
        # questions = await get_creation_questions()
        questions = []
        print(f"questions fetched: {questions}")
        return questions
    except Exception as e:
        print(f"Failed to fetch creation questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
