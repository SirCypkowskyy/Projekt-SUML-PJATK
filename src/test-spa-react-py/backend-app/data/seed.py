from sqlmodel import Session, select
from data.models import CharacterClass, DedicatedMove, User, UserRole
from data.database import engine
from helpers.auth_helper import AuthHelper
from core.config import settings


def seed_database():
    """Dodaje podstawowe dane do bazy danych"""
    with Session(engine) as session:
        if session.exec(select(User)).first() is None:
            __seed_users_and_roles(session)
            __seed_apocalypse_world_data(session)


def __seed_users_and_roles(session: Session):
    """Dodaje podstawowe role i użytkowników"""
    # Dodawanie ról z konfiguracji
    for role_data in settings.initial_data["user_roles"]:
        role = session.exec(
            select(UserRole).where(UserRole.name == role_data["name"])
        ).first()
        
        if not role:
            role = UserRole(**role_data)
            session.add(role)
    
    session.commit()

    # Dodawanie admina
    admin_role = session.exec(
        select(UserRole).where(UserRole.name == "admin")
    ).first()

    admin_user = session.exec(
        select(User).where(User.email == settings.BASE_ADMIN_EMAIL)
    ).first()

    if not admin_user and admin_role:
        auth_helper = AuthHelper(session)
        admin_user = User(
            username=settings.BASE_ADMIN_USERNAME,
            email=settings.BASE_ADMIN_EMAIL,
            hashed_password=auth_helper.get_password_hash(
                settings.BASE_ADMIN_PASSWORD
            ),
            role_id=admin_role.id,
        )
        session.add(admin_user)
        session.commit()


def __seed_apocalypse_world_data(session: Session):
    """Dodaje podstawowe dane świata gry"""
    # Dodawanie klas postaci
    for class_data in settings.initial_data["character_classes"]:
        character_class = session.exec(
            select(CharacterClass).where(CharacterClass.id == class_data["id"])
        ).first()
        
        if not character_class:
            character_class = CharacterClass(**class_data)
            session.add(character_class)
    
    session.commit()

    # Dodawanie ruchów
    for move_data in settings.initial_data["dedicated_moves"]:
        move = session.exec(
            select(DedicatedMove).where(DedicatedMove.name == move_data["name"])
        ).first()
        
        if not move:
            move = DedicatedMove(**move_data)
            session.add(move)
    
    session.commit()
    