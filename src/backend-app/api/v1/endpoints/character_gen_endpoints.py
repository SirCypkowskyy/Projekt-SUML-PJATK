import traceback
from typing import Annotated, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, Cookie
from pydantic import BaseModel
from enum import Enum
from helpers.auth_helper import AuthHelper
from deps import get_auth_helper
from data.models import User, UserRoleEnum, SavedCharacter, CharacterImage
from api.v1.endpoints.auth import ACCESS_TOKEN_COOKIE
from datetime import datetime, timezone
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
    character_image_url: Optional[str]
    """URL do obrazu postaci"""


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

def get_thread_id(user_id: int, auth: AuthHelper) -> str:
    """
    Pobiera identyfikator wątku dla użytkownika.

    :param user_id: ID użytkownika
    :param auth: Helper autentykacji
    :return: Identyfikator wątku
    """
    user = auth.session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")
    return f"{user_id}-{user.generation_attempts+1}"


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
        CharacterClass.ANIOL: [
            Move(
                name="Szósty zmysł",
                description="Gdy otwierasz swój mózg na psychiczny wir, rzuć+spryt zamiast rzucać+dziw."
            ),
            Move(
                name="Własna klinika",
                description="Posiadasz własny szpital, warsztat wyposażony w aparaturę do podtrzymywania życia, laboratorium chemiczne oraz dwuosobowy personel (ekipa). W klinice możesz pracować nad pacjentami tak, jak Technik pracuje nad technologią."
            ),
            Move(
                name="Zawodowe współczucie",
                description="Gdy pomagasz komuś, kto wykonuje rzut, możesz rzucić+spryt zamiast rzucać+Hx."
            ),
            Move(
                name="Anioł bitwy",
                description="Kiedy opiekujesz się ludźmi i nie walczysz, dostajesz +1pancerza."
            ),
            Move(
                name="Uzdrawiający dotyk",
                description="Gdy nakładasz ręce na ciało rannej osoby i otwierasz na nią swój mózg, rzuć+dziw. Na 10+ leczysz 1 segment. Na 7–9 również leczysz 1 segment, ale działasz pod presją ze strony mózgu swojego pacjenta."
            ),
            Move(
                name="Naznaczony przez śmierć",
                description="Jeśli pacjent będący pod twoją opieką umrze, dostajesz +1dziw (max. +3)."
            )
        ],
        CharacterClass.CHOPPER: [
            Move(
                name="Przywódca gangu",
                description="Masz gang motocyklowy (3-osobowy). W gangu panuje lojalność (+1 lojalność). W kryzysie twój gang będzie trzymał się razem."
            ),
            Move(
                name="Alfa gangu",
                description="Gdy chcesz, by twój gang zrobił coś, rzuć+hart. Na 10+ wszyscy wykonują twoje polecenie. Na 7-9 robią to, ale możesz wybrać 1: niechętnie, niechlujnie lub szemrając."
            ),
            Move(
                name="Jatka",
                description="Gdy twój gang walczy ramię w ramię z tobą, otrzymujesz +1pancerza."
            ),
            Move(
                name="Taktyk",
                description="Gdy twój gang wykonuje zorganizowany manewr pod twoim przywództwem, rzuć+spryt. Na 10+ wybierz 3. Na 7-9 wybierz 2: wykonują to szybko, cicho, minimalizują straty, maksymalizują straty, minimalizują chaos."
            )
        ],
        CharacterClass.EGZEKUTOR: [
            Move(
                name="Merytoryczne podejście",
                description="Kiedy wykonujesz agresywny ruch, możesz rzucić+spryt zamiast rzucać+hart."
            ),
            Move(
                name="Bojowy refleks",
                description="Kiedy w walce wyrzucisz 12+, możesz wyeliminować przeciwnika z walki bez zadawania obrażeń (np. rozbroić, powalić, zastraszyć)."
            ),
            Move(
                name="Niebezpieczny & Sexy",
                description="Kiedy wchodzisz w napiętą sytuację, możesz rzucić+urok zamiast rzucać+hart."
            )
        ],
        CharacterClass.GUBERNATOR: [
            Move(
                name="Bogactwo",
                description="Jeśli twoje schronienie jest bezpieczne, na początku sesji otrzymujesz 2-barter."
            ),
            Move(
                name="Forteca",
                description="Twoje schronienie jest wyjątkowo bezpieczne. Kiedy dajesz rozkazy swojej załodze, rzuć+hart. Na 10+ wykonują twoje polecenia sprawnie i skutecznie. Na 7-9 wykonują je, ale wybierz 1: powoli, niechlujnie lub narzekając."
            ),
            Move(
                name="Przywództwo",
                description="Kiedy musisz zmotywować swoją załogę, rzuć+urok. Na 10+ wszyscy wykonują twoje polecenia bez pytań. Na 7-9 wykonują je, ale możesz wybrać 1: niechętnie, chaotycznie lub po swojemu."
            )
        ],
        CharacterClass.GURU: [
            Move(
                name="Magnetyczna osobowość",
                description="Kiedy spotykasz kogoś po raz pierwszy, rzuć+dziw. Na 10+ możesz zadać im 3 pytania z listy. Na 7-9 zadaj 1 pytanie."
            ),
            Move(
                name="Hipnotyczny głos",
                description="Kiedy dajesz komuś rozkaz, rzuć+dziw. Na 10+ wykonują go bez wahania. Na 7-9 wykonują, ale mogą się później opamiętać."
            ),
            Move(
                name="Wizjoner",
                description="Kiedy otwierasz swój umysł na psychiczny wir, otrzymujesz +1 do rzutu."
            )
        ],
        CharacterClass.KIEROWCA: [
            Move(
                name="Szósty bieg",
                description="Kiedy uciekasz lub ścigasz kogoś, rzuć+spryt. Na 10+ udaje ci się bez problemu. Na 7-9 musisz wybrać: bezpiecznie ale wolno, lub szybko ale ryzykownie."
            ),
            Move(
                name="Mechaniczna więź",
                description="Kiedy pracujesz nad swoim pojazdem, rzuć+spryt. Na 10+ wybierz 3 ulepszenia. Na 7-9 wybierz 1: szybszy, bezpieczniejszy, lepiej opancerzony, lepiej uzbrojony."
            ),
            Move(
                name="Król drogi",
                description="Kiedy jesteś za kierownicą, otrzymujesz +1 do wszystkich rzutów związanych z prowadzeniem pojazdu."
            )
        ],
        CharacterClass.MUZA: [
            Move(
                name="Artystyczna dusza",
                description="Kiedy występujesz przed publicznością, rzuć+urok. Na 10+ wybierz 3. Na 7-9 wybierz 1: zdobywasz fanów, zarabiasz barter, inspirujesz innych, przekazujesz wiadomość."
            ),
            Move(
                name="Hipnotyczny występ",
                description="Kiedy występujesz, możesz próbować manipulować kimś z publiczności. Rzuć+urok. Na 10+ robią to, co chcesz. Na 7-9 robią to, ale z pewnym wahaniem."
            ),
            Move(
                name="Inspiracja",
                description="Kiedy pomagasz komuś, kto cię podziwia, dodajesz +2 zamiast +1."
            )
        ],
        CharacterClass.OPERATOR: [
            Move(
                name="Profesjonalista",
                description="Kiedy wykonujesz swoją robotę, rzuć+spryt. Na 10+ wszystko idzie zgodnie z planem. Na 7-9 jest prawie dobrze, ale wybierz 1 komplikację."
            ),
            Move(
                name="Przygotowany",
                description="Kiedy potrzebujesz specjalistycznego sprzętu, rzuć+spryt. Na 10+ masz dokładnie to, czego potrzebujesz. Na 7-9 masz coś podobnego."
            ),
            Move(
                name="Improwizacja",
                description="Kiedy musisz użyć czegoś nie po jego przeznaczeniu, rzuć+spryt. Na 10+ działa idealnie. Na 7-9 działa, ale z ograniczeniami."
            )
        ],
        CharacterClass.PSYCHOL: [
            Move(
                name="Szaleństwo",
                description="Kiedy wpadasz w szał, rzuć+dziw. Na 10+ wybierz 3. Na 7-9 wybierz 1: zadajesz więcej obrażeń, otrzymujesz mniej obrażeń, wzbudzasz strach, ignorujesz ból."
            ),
            Move(
                name="Nieobliczalny",
                description="Kiedy ktoś próbuje cię przejrzeć, rzuć+dziw. Na 10+ nie mogą cię rozgryźć. Na 7-9 są zdezorientowani."
            ),
            Move(
                name="Głosy",
                description="Kiedy otwierasz swój umysł na psychiczny wir, rzuć+dziw. Na 10+ otrzymujesz przydatną informację. Na 7-9 informacja jest niejasna lub niepełna."
            )
        ],
        CharacterClass.TEKKNIK: [
            Move(
                name="Majsterkowicz",
                description="Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3. Na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu."
            ),
            Move(
                name="Złota rączka",
                description="Kiedy naprawiasz coś w stresującej sytuacji, rzuć+spryt. Na 10+ naprawiasz bez problemu. Na 7-9 naprawiasz, ale wybierz 1: zajmuje to więcej czasu, potrzebujesz dodatkowych części, nie będzie działać długo."
            ),
            Move(
                name="Wynalazca",
                description="Kiedy tworzysz coś nowego, rzuć+spryt. Na 10+ działa dokładnie tak, jak chciałeś. Na 7-9 działa, ale ma jakąś wadę lub ograniczenie."
            )
        ],
        CharacterClass.ZYLETA: [
            Move(
                name="Zabójczy refleks",
                description="Kiedy ktoś próbuje cię zaskoczyć, rzuć+spryt. Na 10+ masz przewagę. Na 7-9 reagujesz w ostatniej chwili."
            ),
            Move(
                name="Śmiertelny taniec",
                description="W walce wręcz zadajesz +1 obrażeń i otrzymujesz +1 pancerza."
            ),
            Move(
                name="Zimna krew",
                description="Kiedy działasz pod presją w walce, rzuć+spokój zamiast rzucać+hart."
            )
        ],
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
        CharacterClass.ANIOL: [
            Equipment(name="Apteczka anioła", description="Podstawowe wyposażenie medyczne", isRemovable=True),
            Equipment(name="Różności", description="Wartość: 1-barter", isRemovable=True),
            Equipment(name="Ubranie robocze", description="1-pancerz", isRemovable=False)
        ],
        CharacterClass.CHOPPER: [
            Equipment(name="Ubranie motocyklisty", description="2-pancerz", isRemovable=False),
            Equipment(
                name="Motocykl",
                description="moc+1, wygląd+1, 1-pancerza",
                isRemovable=False,
                options=[
                    {"name": "zalety", "effect": "szybki, wytrzymały, agresywny, mocno podkręcony, wielki, zwrotny"},
                    {"name": "wygląd", "effect": "opływowy kształt, vintage, mocno odchudzony, rycząca bestia, masywny, muskularny, szpanerski, luksusowy"},
                    {"name": "słabości", "effect": "wolny, zaniedbany, cholernie dużo pali, drobny, niestabilny, kapryśny, zawodny"}
                ]
            )
        ],
        CharacterClass.EGZEKUTOR: [
            Equipment(name="Pancerz", description="2-pancerz", isRemovable=False),
            Equipment(name="Różności", description="Wartość: 1-barter", isRemovable=True)
        ],
        CharacterClass.GUBERNATOR: [
            Equipment(
                name="Posiadłość",
                description="75-150 dusz, prowizoryczne zabudowania, zbrojownia, gang 40 osób",
                isRemovable=False,
                options=[
                    {"name": "fuchy", "effect": "polowanie, uprawy, szabrownictwo (nadwyżka: 1-barter, potrzeba: +głód)"},
                    {"name": "zabudowania", "effect": "prowizoryczne z betonu, blachy i drutu zbrojeniowego (+1pancerza dla gangu)"},
                    {"name": "zbrojownia", "effect": "prowizoryczna i znaleziona broń"},
                    {"name": "gang", "effect": "40 osób (3-rany, gang, średni, niezdyscyplinowany, 1-pancerza)"}
                ]
            )
        ],
        CharacterClass.GURU: [
            Equipment(name="Różności", description="Wartość: 2-barter", isRemovable=True),
            Equipment(
                name="Wyznawcy",
                description="20 wyznawców, lojalni ale nie fanatyczni",
                isRemovable=False,
                options=[
                    {"name": "fortuna", "effect": "+1"},
                    {"name": "nadwyżka", "effect": "1-barter"},
                    {"name": "potrzeba", "effect": "dezercja"}
                ]
            )
        ],
        CharacterClass.KIEROWCA: [
            Equipment(name="Różności", description="Wartość: 2-barter", isRemovable=True),
            Equipment(
                name="Auto",
                description="Wybierz profil: Moc+2 Wygląd+1 1-Pancerza Słabość+1",
                isRemovable=False,
                options=[
                    {"name": "typ", "effect": "Coupe, kompakt, sedan, jeep, pickup, van, ciężarówka, bus, limuzyna, ambulans, auto z napędem na cztery koła, ciągnik"},
                    {"name": "zalety", "effect": "Szybki, wytrzymały, agresywny, podkręcony, wielki, terenowy, zwrotny, kompatybilny, pojemny, niezawodny, łatwy w naprawie"},
                    {"name": "wygląd", "effect": "Opływowy kształt, vintage, w idealnym stanie, potężny, luksusowy, szpanerski, muskularny, dziwaczny, ładny"},
                    {"name": "słabości", "effect": "Wolny, delikatna budowa, zaniedbany, kapryśny, ciasny, dużo pali, zawodny, głośny, skoki prędkości"}
                ]
            )
        ],
        CharacterClass.MUZA: [
            Equipment(name="Różności", description="Wartość: 1-barter", isRemovable=True),
            Equipment(
                name="Luksusowy sprzęt",
                description="Wybierz 2 sztuki",
                isRemovable=True,
                options=[
                    {"name": "zabytkowe monety", "effect": "zakładane, wartościowe, mogą być używane jako biżuteria"},
                    {"name": "okulary", "effect": "zakładane, wartościowe, +1spryt gdy wzrok ma znaczenie"},
                    {"name": "długi piękny płaszcz", "effect": "zakładany, wartościowy"},
                    {"name": "niesamowite tatuaże", "effect": "implant"},
                    {"name": "kosmetyki", "effect": "nakładane, wartościowe, +1 do następnego rzutu na urok"},
                    {"name": "zwierzę", "effect": "wartościowe, żywe"}
                ]
            )
        ],
        CharacterClass.OPERATOR: [
            Equipment(name="9mm", description="2-rany, bliski, głośny", isRemovable=True, isWeapon=True),
            Equipment(name="Różności", description="Wartość: 1-barter", isRemovable=True),
            Equipment(name="Ubranie", description="1-pancerz", isRemovable=False)
        ],
        CharacterClass.PSYCHOL: [
            Equipment(name="Różności", description="Wartość: 5-barter", isRemovable=True),
            Equipment(name="Ubranie", description="1-pancerz", isRemovable=False),
            Equipment(
                name="Sprzęt psychola",
                description="Wybierz 2 rzeczy",
                isRemovable=True,
                options=[
                    {"name": "strzykawka z implantem", "effect": "dotyk, hi-tech, +1rana do ruchów psychola"},
                    {"name": "transmiter fal mózgowych", "effect": "obszarowy, bliski, hi-tech"},
                    {"name": "meta-narkotyki", "effect": "dotyk, hi-tech, +1zatrzymanie"},
                    {"name": "rękawica psychogwałtu", "effect": "ramię, hi-tech, dotyk liczy się jako czas i fizyczna bliskość"},
                    {"name": "projektor fal bólu", "effect": "1-rana, ppanc, obszarowy, głośny, przeładowanie, hi-tech"},
                    {"name": "psychiczne stopery", "effect": "zakładane, hi-tech, chronią przed ruchami i sprzętem psychola"}
                ]
            )
        ],
        CharacterClass.TEKKNIK: [
            Equipment(name="Różności", description="Wartość: 3-barter", isRemovable=True),
            Equipment(
                name="Warsztat",
                description="Wybierz 3 elementy",
                isRemovable=False,
                options=[
                    {"name": "garaż", "effect": "Miejsce do naprawy pojazdów"},
                    {"name": "ciemnia", "effect": "Miejsce do wywoływania zdjęć i eksperymentów"},
                    {"name": "kontrolowana przestrzeń hodowlana", "effect": "Miejsce do hodowli roślin i eksperymentów"},
                    {"name": "wykwalifikowani pracownicy", "effect": "Np. Carna, Thuy, Pamming"},
                    {"name": "góra złomu", "effect": "Materiały do wykorzystania"},
                    {"name": "ciężarówka lub samochód towarowy", "effect": "Transport"},
                    {"name": "dziwaczna elektronika", "effect": "Specjalistyczny sprzęt"},
                    {"name": "narzędzia do obróbki materiałów", "effect": "Podstawowe wyposażenie"},
                    {"name": "transmitery i receptory", "effect": "Sprzęt komunikacyjny"},
                    {"name": "teren doświadczalny", "effect": "Miejsce do testów"},
                    {"name": "relikt złotej ery", "effect": "Zaawansowana technologia"},
                    {"name": "miny i pułapki", "effect": "Systemy obronne"}
                ]
            )
        ],
        CharacterClass.ZYLETA: [
            Equipment(name="Różności", description="Wartość: 2-barter", isRemovable=True),
            Equipment(name="Ubranie", description="1-pancerz lub 2-pancerz", isRemovable=False),
            Equipment(
                name="Spersonalizowana broń",
                description="Wybierz 2 sztuki",
                isRemovable=True,
                isWeapon=True,
                options=[
                    {"name": "katana", "effect": "3-rany, bliski, cenny"},
                    {"name": "sztylet", "effect": "2-rany, intymny"},
                    {"name": "ukryta broń", "effect": "2-rany, intymny, ukryty"},
                    {"name": "pistolet", "effect": "2-rany, bliski, głośny, przeładowanie"},
                    {"name": "bicz", "effect": "1-rana, obszarowy, bliski"},
                    {"name": "kastety", "effect": "1-rana, intymny"}
                ]
            )
        ]
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
        CharacterClass.ANIOL: [
            Equipment(
                name="mała praktyczna broń",
                description="2-rany, bliski",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.CHOPPER: [
            Equipment(
                name="magnum",
                description="3-rany, bliski, przeładowanie, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="pistolet maszynowy",
                description="2-rany, bliski, obszarowy, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="maczeta",
                description="2-rany, bliski",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.EGZEKUTOR: [
            Equipment(
                name="wielka broń",
                description="3-rany, bliski, obszarowy, forsowny, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="poważna broń",
                description="2-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="zapasowa broń",
                description="2-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.GUBERNATOR: [
            Equipment(
                name="ozdobna broń",
                description="2-rany, bliski, cenny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="praktyczna broń",
                description="2-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.GURU: [
            Equipment(
                name="broń ceremonialna",
                description="2-rany, bliski, cenny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.KIEROWCA: [
            Equipment(
                name="pistolet",
                description="2-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="strzelba",
                description="3-rany, bliski, forsowny, głośny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.MUZA: [
            Equipment(
                name="ukryta broń",
                description="2-rany, intymny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="elegancka broń",
                description="2-rany, bliski, cenny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.OPERATOR: [
            Equipment(
                name="9mm",
                description="2-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="wizytówka",
                description="3-rany, bliski, głośny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.PSYCHOL: [
            Equipment(
                name="dziwaczna broń",
                description="2-rany, bliski, obszarowy",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="ukryta broń",
                description="2-rany, intymny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.TEKKNIK: [
            Equipment(
                name="improwizowana broń",
                description="2-rany, bliski",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="dziwaczna broń",
                description="2-rany, obszarowy, głośny",
                isRemovable=True,
                isWeapon=True
            )
        ],
        CharacterClass.ZYLETA: [
            Equipment(
                name="katana",
                description="3-rany, bliski, cenny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="sztylet",
                description="2-rany, intymny",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="ukryta broń",
                description="2-rany, intymny, ukryty",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="pistolet",
                description="2-rany, bliski, głośny, przeładowanie",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="bicz",
                description="1-rana, obszarowy, bliski",
                isRemovable=True,
                isWeapon=True
            ),
            Equipment(
                name="kastety",
                description="1-rana, intymny",
                isRemovable=True,
                isWeapon=True
            )
        ]
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
        CharacterClass.ANIOL: "Leżysz w piachu Świata Apokalipsy, z akami na wierzchu, a twój anioł stróż to ktoś z apteczką i igłą. Kiedy wszystko się wali, kiedy gang się wykrwawia, kiedy zaraza pustoszy osadę, kiedy dzieciak ma złamane obie nogi - wtedy wzywasz anioła. Oni są od tego.",
        CharacterClass.CHOPPER: "Świat Apokalipsy to niedobór wszystkiego, wiesz jak jest. Nie ma wystarczająco dużo benzyny, amunicji, wody, drutu kolczastego, mięsa, czasu ani niczego. Ale jest jedna rzecz, której jest pod dostatkiem: dupków. Chopperzy to ci, którzy organizują tych dupków i robią z nich gang.",
        CharacterClass.EGZEKUTOR: "Świat Apokalipsy jest podły, ohydny i pełen przemocy. Twój egzekutor jest w tym wszystkim jak ryba w wodzie. Nie ma dla niego znaczenia, czy chodzi o walkę wręcz, czy o wymianę ognia - on po prostu wie, jak zabijać.",
        CharacterClass.GUBERNATOR: "W Świecie Apokalipsy nie istnieje rząd ani zorganizowane społeczeństwo. Kiedy ktoś chce coś zbudować, musi zacząć od zera. Gubernatorzy to ci, którzy próbują stworzyć coś z niczego, zebrać ludzi i zasoby, by przetrwać w tym brutalnym świecie.",
        CharacterClass.GURU: "Teraz powinno być już jasne jak słońce, że bogowie opuścili Świat Apokalipsy. Guru to ci, którzy wypełniają tę pustkę, oferując nowe wierzenia i nadzieję w świecie, który stracił wszystko. Są przewodnikami duchowymi, manipulatorami i wizjonerami.",
        CharacterClass.KIEROWCA: "Wraz z nadejściem apokalipsy nastąpił rozpad infrastruktury złotej ery. Drogi zarosły, mosty się zawaliły, a paliwo stało się na wagę złota. Kierowcy to ci, którzy mimo wszystko potrafią przemierzać ten wrogi świat, prowadząc swoje maszyny przez pustkowia.",
        CharacterClass.MUZA: "Nawet w plugawym Świecie Apokalipsy istnieje piękno i sztuka. Muzy to artyści, którzy potrafią zaczarować innych swoim talentem, wykorzystując swój urok i charyzmę do przetrwania w tym brutalnym świecie.",
        CharacterClass.OPERATOR: "W Świecie Apokalipsy musisz pracować z tym, co masz pod ręką. Operatorzy to specjaliści od załatwiania spraw - czy to przez negocjacje, czy przez bardziej bezpośrednie metody. Są ekspertami od przetrwania w świecie, gdzie wszystko ma swoją cenę.",
        CharacterClass.PSYCHOL: "Psychole są najbardziej popierdolonymi psychicznymi mózgojebami w Świecie Apokalipsy. Są nieprzewidywalni, niebezpieczni i często obdarzeni dziwnymi mocami, które pozwalają im manipulować umysłami innych.",
        CharacterClass.TEKKNIK: "Jest jedna rzecz, na którą zawsze można liczyć w Świecie Apokalipsy: wszystko się psuje. Tekknicy to ci, którzy potrafią naprawiać i tworzyć rzeczy z resztek starego świata, wykorzystując swoją wiedzę i umiejętności do budowania czegoś nowego.",
        CharacterClass.ZYLETA: "Nawet w tak niebezpiecznym miejscu jak Świat Apokalipsy, żylety są wyjątkowe. Są jak nęcące błękitne iskry - nie możesz oderwać od nich wzroku, choć wiesz, że zbliżenie się do nich może być śmiertelnie niebezpieczne. Łączą w sobie piękno i śmiertelne niebezpieczeństwo.",
        CharacterClass.MECHANIK: "Mechanik to człowiek, który zna się na sprzęcie. W świecie, gdzie każda maszyna jest na wagę złota, a części zamienne są rzadkością, mechanicy są na wagę złota. Potrafią utrzymać przy życiu stare maszyny i tworzyć nowe z resztek starego świata."
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
    user = auth.session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

    try:
        input_answers = {"answers": [{"answer": answers.get(str(i))} for i in range(1, 4)]}

        config = {"configurable": {"thread_id": get_thread_id(user_id, auth)}}

        # Wywołaj LangGraph
        resp = graph.invoke(Command(resume=input_answers), config=config)

        # Zwiększ licznik prób generowania
        user.generation_attempts += 1
        auth.session.commit()

        print(f"Moves: {resp['moves']}")
        print(f"Stuffs: {resp['character_specs']['stuffs']}")
        print("=" * 80)
        print(f"Specs: {resp['character_specs']}")

        if not isinstance(resp, dict):
            raise ValueError("Nieprawidłowa odpowiedź z LangGraph - odpowiedź nie jest słownikiem")

        if "character_specs" not in resp or "summary" not in resp:
            raise ValueError("Nieprawidłowa odpowiedź z LangGraph - brak wymaganych danych")
        
        print(f"Resp: {resp}")
        print(f"Resp image_url: {resp['image_url']}")

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
            character_image_url=resp["image_url"] if "image_url" in resp else "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEHp9Th4i6BORcPXDqvl0Pnvw-mKeSWUQvdw&s",
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
    user = auth.session.get(User, user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")
    
    try:
        # Przygotuj dane wejściowe dla LangGraph
        input_data = {
            "messages": f"{initial_info.characterBasics}\n\n{initial_info.characterBackground}\n\n{initial_info.characterTraits}\n\n{initial_info.worldDescription}"
        }

        config = {"configurable": {"thread_id": get_thread_id(user_id, auth)}}

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
    user = auth.session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

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

        config = {"configurable": {"thread_id": get_thread_id(user_id, auth)}}

        # Wywołaj LangGraph tylko dla generowania obrazu
        resp = graph.invoke(input_data, config=config)

        # Zapisz URL obrazu w bazie danych
        character_image = CharacterImage(
            character_id=character_id,
            image_url=resp["image_url"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
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


# Usuwanie postaci
@router.delete("/saved-characters/{character_id}")
async def delete_character(
    character_id: int,
    access_token: Annotated[Union[str, None], Cookie(alias=ACCESS_TOKEN_COOKIE)] = None,
    auth: AuthHelper = Depends(get_auth_helper),
) -> None:
    """Usuwa postać z bazy danych."""
    auth.verify_logged_in_user(access_token, UserRoleEnum.USER)
    user_id = auth.verify_token(access_token, "access")

    # Pobierz postać z bazy danych
    character = (
        auth.session.query(SavedCharacter).filter(SavedCharacter.id == character_id, SavedCharacter.user_id == user_id).first()
    )
    
    if not character:
        raise HTTPException(status_code=404, detail="Postać nie znaleziona")
    
    # Zobacz, czy postać należy do użytkownika
    if character.user_id != user_id:
        raise HTTPException(status_code=403, detail="Nie masz uprawnień do usuwania tej postaci")
    
    # Usuń postać z bazy danych
    auth.session.delete(character)
    auth.session.commit()

    return {"message": "Postać została usunięta"}