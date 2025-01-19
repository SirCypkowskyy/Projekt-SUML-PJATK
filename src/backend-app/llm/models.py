from typing import Dict, List, Optional, Union

from pydantic import Field
from typing_extensions import Annotated, TypedDict


class Answer(TypedDict):
    """Answer to a question"""

    answer: Annotated[str, ..., "The answer to the question"]


class Question(TypedDict):
    """Question to ask the user"""

    question: Annotated[str, ..., "The question to ask the user"]
    guidance: Annotated[str, ..., "Guidance to help the user answer the question"]
    answer: Annotated[Optional[str], ...]


class Questions(TypedDict):
    """List of questions to ask the user"""

    questions: List[Question] = Field(description="The questions to ask the user", min_length=3)


class CharactersSummary(TypedDict):
    """Summary of the characters in the story"""

    appearance: Annotated[str, ..., "Description of the character's appearance"]
    description: Annotated[str, ..., "Description of the character"]


class Move(TypedDict):
    """Moves of the character"""

    name: Annotated[str, ..., "The name of the move"]
    description: Annotated[str, ..., "The description of the move"]


class Stuff(TypedDict):
    """Stuff (Sprzęt) of the character"""

    name: Annotated[str, ..., "The name of the stuff"]
    additional_info: Annotated[str, ..., "The additional information about the stuff"]
    isRemovable: Annotated[bool, False, "Whether the stuff can be removed"]
    isWeapon: Annotated[bool, False, "Whether the stuff is a weapon"]
    options: Optional[List[Dict[str, str]]] = None


class CharacterMoves(TypedDict):
    """Character moves"""

    basic_moves: Union[str, List[Move]] = Field(
        description="The basic moves of the character",
        default="Dostajesz wszystkie ruchy podstawowe",
    )
    class_moves: list[Move] = Field(description="The moves of the character's class")


class CharacterTraits(TypedDict):
    """Character traits"""

    name: Annotated[str, ..., "The name of the trait"]
    modifier: Annotated[str, ..., "The modifier of the trait. ex. -1, 0, +1, +2"]


class CharacterSpecs(TypedDict):
    """Specifications of the character"""

    name: Annotated[str, ..., "The name of the character"]
    traits: Annotated[list[CharacterTraits], ..., "The set of characteristics. Zestaw cech postaci"]
    stuffs: Annotated[list[Stuff], ..., "The stuffs of the character"]
