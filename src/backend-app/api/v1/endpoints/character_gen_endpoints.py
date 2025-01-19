import traceback
from typing import Annotated, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, Cookie
from pydantic import BaseModel
from enum import Enum
from helpers.auth_helper import AuthHelper
from deps import get_auth_helper
from data.models import UserRoleEnum, SavedCharacter, CharacterImage
from api.v1.endpoints.auth import ACCESS_TOKEN_COOKIE
from datetime import datetime
from llm.llm_graph import graph
from langgraph.types import Command

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
    description: str = ""
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
    guidance: str = ""
    """Wskazówka do pytania"""


class QuestionAnswers(BaseModel):
    """Odpowiedzi na pytania"""

    answers: Dict[str, str]
    """Kolekcja id - odpowiedź"""


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


class SavedCharacterResponse(BaseModel):
    """Model odpowiedzi z zapisaną postacią"""

    id: int
    name: str
    character_class: str
    stats: Dict
    appearance: str
    description: str
    moves: List[Dict]
    equipment: List[Dict]
    created_at: datetime
    updated_at: datetime


# Endpointy


@router.get("/moves/{character_class}", response_model=List[Move])
async def get_available_moves(
    character_class: CharacterClass,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> List[Move]:
    """
    Pobiera dostępne ruchy dla danej klasy postaci.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    moves_dict = {
        CharacterClass.MECHANIK: [
            Move(
                name="Majsterkowicz",
                description="Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3, na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu.",
            )
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in moves_dict:
        raise HTTPException(status_code=404, detail="Klasa postaci nie znaleziona")

    return moves_dict[character_class]


@router.get("/equipment/{character_class}", response_model=List[Equipment])
async def get_base_equipment(
    character_class: CharacterClass,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> List[Equipment]:
    """
    Pobiera podstawowy ekwipunek dla danej klasy postaci.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)

    equipment_dict = {
        CharacterClass.MECHANIK: [
            Equipment(name="Skórzany kombinezon", description="1-pancerz", isRemovable=False)
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in equipment_dict:
        raise HTTPException(status_code=404, detail="Klasa postaci nie znaleziona")

    return equipment_dict[character_class]


@router.get("/weapons/{character_class}", response_model=List[Equipment])
async def get_available_weapons(
    character_class: CharacterClass,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> List[Equipment]:
    """
    Pobiera dostępne bronie dla danej klasy postaci.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)

    weapons_dict = {
        CharacterClass.MECHANIK: [
            Equipment(
                name="klucz francuski",
                description="2-rany, ramię",
                isRemovable=True,
                isWeapon=True,
                options=[{"name": "wzmocniony", "effect": "+1rana"}],
            )
        ],
        # ... dodaj pozostałe klasy
    }

    if character_class not in weapons_dict:
        raise HTTPException(status_code=404, detail="Klasa postaci nie znaleziona")

    return weapons_dict[character_class]


@router.get("/class-description/{character_class}", response_model=Dict[str, str])
async def get_class_description(
    character_class: CharacterClass,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> Dict[str, str]:
    """
    Pobiera opis klasy postaci.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
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
        CharacterClass.MECHANIK: "Mechanik to człowiek, który zna się na sprzęcie. Nie zna się na sprzęcie? To nie jest mechanik.",
    }

    if character_class not in descriptions:
        raise HTTPException(status_code=404, detail="Klasa postaci nie znaleziona")

    return {"description": descriptions[character_class]}


@router.post("/generate", response_model=GeneratedCharacter)
async def generate_character(
    initial_info: InitialInfo,
    questions: Optional[List[Question]] = None,
    answers: Optional[Dict[str, str]] = None,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> GeneratedCharacter:
    """
    Generuje postać na podstawie podanych informacji używając LangGraph.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    try:
        input_answers = {"answers": [{"answer": answers.get(str(i))} for i in range(1, 4)]}

        config = {"configurable": {"thread_id": str(user_id)}}

        # Wywołaj LangGraph
        resp = graph.invoke(Command(resume=input_answers), config=config)

        print(f"Moves: {resp['moves']}")
        print(f"Stuffs: {resp['character_specs']['stuffs']}")
        print("=" * 80)
        print(f"Specs: {resp['character_specs']}")

        if not isinstance(resp, dict):
            raise ValueError("Nieprawidłowa odpowiedź z LangGraph - odpowiedź nie jest słownikiem")

        if "character_specs" not in resp or "summary" not in resp:
            raise ValueError("Nieprawidłowa odpowiedź z LangGraph - brak wymaganych danych")

        character = GeneratedCharacter(
            name=resp["character_specs"]["name"],
            characterClass=resp["character_class"] if "character_class" in resp else "Mechanik",
            stats=Stats(
                cool=int(
                    next(
                        t["modifier"]
                        for t in resp["character_specs"]["traits"]
                        if t["name"].lower() == "spokój"
                    )
                ),
                hard=int(
                    next(
                        t["modifier"]
                        for t in resp["character_specs"]["traits"]
                        if t["name"].lower() == "hart"
                    )
                ),
                hot=int(
                    next(
                        t["modifier"]
                        for t in resp["character_specs"]["traits"]
                        if t["name"].lower() == "urok"
                    )
                ),
                sharp=int(
                    next(
                        t["modifier"]
                        for t in resp["character_specs"]["traits"]
                        if t["name"].lower() == "spryt"
                    )
                ),
                weird=int(
                    next(
                        t["modifier"]
                        for t in resp["character_specs"]["traits"]
                        if t["name"].lower() == "dziw"
                    )
                ),
            ),
            appearance=resp["summary"]["appearance"],
            description=resp["summary"]["description"],
            moves=[
                Move(name=move["name"], description=move["description"])
                for move in resp["moves"]["class_moves"]
            ],
            equipment=[
                Equipment(
                    name=stuff["name"],
                    description=stuff["additional_info"],
                    isRemovable=stuff.get("isRemovable", False),
                    isWeapon=stuff.get("isWeapon", False),
                    options=stuff.get("options", None),
                )
                for stuff in resp["character_specs"]["stuffs"]
            ],
        )

        return character

    except Exception as e:
        print(f"Error generating character: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Błąd podczas generowania postaci: {str(e)}")


@router.post("/questions", response_model=List[Question])
async def fetch_creation_questions(
    initial_info: InitialInfo,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> List[Question]:
    """
    Pobiera pytania do tworzenia postaci na podstawie informacji początkowych używając LangGraph.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    try:
        # Przygotuj dane wejściowe dla LangGraph
        input_data = {
            "messages": f"{initial_info.characterBasics}\n\n{initial_info.characterBackground}\n\n{initial_info.characterTraits}\n\n{initial_info.worldDescription}"
        }

        config = {"configurable": {"thread_id": str(user_id)}}

        # Wywołaj LangGraph
        resp = graph.invoke(input_data, config=config)

        # Konwertuj pytania z LangGraph na format API
        questions = [
            Question(text=q["question"], type="text", guidance=q["guidance"])
            for q in resp["questions"]["questions"]
        ]

        return questions

    except Exception as e:
        print(f"Failed to fetch creation questions: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania pytań: {str(e)}")


@router.post("/save", response_model=GeneratedCharacter)
async def save_character(
    character: GeneratedCharacter,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> GeneratedCharacter:
    """
    Zapisuje wygenerowaną postać.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")
    print(f"Saving character for user {user_id}: {character}")

    try:
        # Konwertuj postać na model bazy danych
        saved_character = SavedCharacter(
            user_id=user_id,
            name=character.name,
            character_class=character.characterClass,
            stats=character.stats.model_dump(),
            appearance=character.appearance,
            description=character.description,
            moves=[move.model_dump() for move in character.moves],
            equipment=[item.model_dump() for item in character.equipment],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Zapisz postać w bazie danych
        auth.session.add(saved_character)
        auth.session.commit()
        auth.session.refresh(saved_character)

        print(f"Character saved successfully with ID: {saved_character.id}")
        return character

    except Exception as e:
        auth.session.rollback()
        print(f"Error saving character: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas zapisywania postaci: {str(e)}")


@router.get("/saved-characters", response_model=List[SavedCharacterResponse])
async def get_saved_characters(
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> List[SavedCharacterResponse]:
    """
    Pobiera wszystkie zapisane postacie użytkownika.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    try:
        # Pobierz postacie z bazy danych
        saved_characters = (
            auth.session.query(SavedCharacter)
            .filter(SavedCharacter.user_id == user_id)
            .order_by(SavedCharacter.created_at.desc())
            .all()
        )

        return [
            SavedCharacterResponse(
                id=char.id,
                name=char.name,
                character_class=char.character_class,
                stats=char.stats,
                appearance=char.appearance,
                description=char.description,
                moves=char.moves,
                equipment=char.equipment,
                created_at=char.created_at,
                updated_at=char.updated_at,
            )
            for char in saved_characters
        ]

    except Exception as e:
        print(f"Error fetching saved characters: {e}")
        raise HTTPException(
            status_code=500, detail=f"Błąd podczas pobierania zapisanych postaci: {str(e)}"
        )


@router.get("/saved-characters/stats", response_model=Dict[str, int])
async def get_characters_stats(
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> Dict[str, int]:
    """
    Pobiera statystyki zapisanych postaci użytkownika.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    try:
        # Pobierz statystyki z bazy danych
        total_characters = (
            auth.session.query(SavedCharacter).filter(SavedCharacter.user_id == user_id).count()
        )

        # Pobierz liczbę postaci utworzonych w tym miesiącu
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        characters_this_month = (
            auth.session.query(SavedCharacter)
            .filter(SavedCharacter.user_id == user_id, SavedCharacter.created_at >= current_month)
            .count()
        )

        return {"total": total_characters, "this_month": characters_this_month}

    except Exception as e:
        print(f"Error fetching character stats: {e}")
        raise HTTPException(
            status_code=500, detail=f"Błąd podczas pobierania statystyk postaci: {str(e)}"
        )


@router.get("/saved-characters/{character_id}", response_model=SavedCharacterResponse)
async def get_character(
    character_id: int,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> SavedCharacterResponse:
    """
    Pobiera pojedynczą postać użytkownika.
    Dostęp ma tylko właściciel postaci.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    try:
        # Pobierz postać z bazy danych
        character = (
            auth.session.query(SavedCharacter).filter(SavedCharacter.id == character_id).first()
        )

        if not character:
            raise HTTPException(status_code=404, detail="Postać nie została znaleziona")

        # Sprawdź czy użytkownik jest właścicielem postaci
        if character.user_id != user_id:
            raise HTTPException(
                status_code=403, detail="Nie masz uprawnień do wyświetlenia tej postaci"
            )

        return SavedCharacterResponse(
            id=character.id,
            name=character.name,
            character_class=character.character_class,
            stats=character.stats,
            appearance=character.appearance,
            description=character.description,
            moves=character.moves,
            equipment=character.equipment,
            created_at=character.created_at,
            updated_at=character.updated_at,
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching character: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas pobierania postaci: {str(e)}")


@router.put("/saved-characters/{character_id}", response_model=SavedCharacterResponse)
async def update_character(
    character_id: int,
    character: GeneratedCharacter,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> SavedCharacterResponse:
    """
    Aktualizuje zapisaną postać.
    """
    user = auth.verify_logged_in_user(access_token, UserRoleEnum.USER)

    # Pobierz postać z bazy danych
    saved_character = (
        auth.session.query(SavedCharacter)
        .filter(SavedCharacter.id == character_id, SavedCharacter.user_id == user.id)
        .first()
    )

    if not saved_character:
        raise HTTPException(status_code=404, detail="Postać nie znaleziona")

    # Aktualizuj dane postaci
    saved_character.name = character.name
    saved_character.character_class = character.characterClass
    saved_character.stats = character.stats.model_dump()
    saved_character.appearance = character.appearance
    saved_character.description = character.description
    saved_character.moves = [move.model_dump() for move in character.moves]
    saved_character.equipment = [equipment.model_dump() for equipment in character.equipment]
    saved_character.updated_at = datetime.utcnow()

    auth.session.commit()

    return SavedCharacterResponse(
        id=saved_character.id,
        name=saved_character.name,
        character_class=saved_character.character_class,
        stats=saved_character.stats,
        appearance=saved_character.appearance,
        description=saved_character.description,
        moves=saved_character.moves,
        equipment=saved_character.equipment,
        created_at=saved_character.created_at,
        updated_at=saved_character.updated_at,
    )


# Dodaj nowy model dla obrazu postaci


class CharacterImage(BaseModel):
    """Model dla obrazu postaci"""

    character_id: int
    image_url: str
    created_at: datetime
    updated_at: datetime


@router.post("/generate-image/{character_id}", response_model=CharacterImage)
async def generate_character_image(
    character_id: int,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> CharacterImage:
    """
    Generuje obraz dla istniejącej postaci używając LangGraph.
    """
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    # Pobierz postać
    character = (
        auth.session.query(SavedCharacter)
        .filter(SavedCharacter.id == character_id, SavedCharacter.user_id == user_id)
        .first()
    )

    if not character:
        raise HTTPException(status_code=404, detail="Postać nie znaleziona")

    try:
        # Przygotuj dane dla LangGraph
        input_data = {"messages": f"{character.appearance}\n\n{character.description}"}

        config = {"configurable": {"thread_id": str(user_id)}}

        # Wywołaj LangGraph tylko dla generowania obrazu
        resp = graph.invoke(input_data, config=config)

        # Zapisz URL obrazu w bazie danych
        character_image = CharacterImage(
            character_id=character_id,
            image_url=resp["image_url"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        auth.session.add(character_image)
        auth.session.commit()
        auth.session.refresh(character_image)

        return character_image

    except Exception as e:
        auth.session.rollback()
        print(f"Error generating character image: {e}")
        raise HTTPException(
            status_code=500, detail=f"Błąd podczas generowania obrazu postaci: {str(e)}"
        )
