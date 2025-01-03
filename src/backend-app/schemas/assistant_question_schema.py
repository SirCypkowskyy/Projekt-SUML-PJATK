from pydantic import BaseModel


class AssistantQuestionSchema(BaseModel):
    """Schema dla pytania od asystenta (przy generacji karty postaci)"""
    question: str
    """Pytanie od asystenta"""
    context: str
    """Kontekst pytania"""

class AssistantAnswerSchema(BaseModel):
    """Schema dla odpowiedzi asystenta (przy generacji karty postaci)"""
    answer: str
    """Odpowiedź użytkownika"""
    context: str
    """Kontekst odpowiedzi"""