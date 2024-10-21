from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.future import select

from data.models.user import User, UserCreate, UserUpdate, UserInDB, UserResponse
from data.database import AsyncDatabaseSession, db as session

users_crud_router = APIRouter(tags=["users"])

# Create
@users_crud_router.post("/users/")
async def create_user(user_create: UserCreate, session: AsyncDatabaseSession = Depends(session.get_session)) -> UserResponse:
    user = User(**user_create.dict())
    session.add(user)
    await session.commit()
    return user

# Read
@users_crud_router.get("/users/{user_id}")
async def read_user(user_id: int, session: AsyncDatabaseSession = Depends(session.get_session)):
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

# Update
@users_crud_router.put("/users/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, session: AsyncDatabaseSession = Depends(session.get_session)):
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    await session.commit()
    return user

# Delete
@users_crud_router.delete("/users/{user_id}")
async def delete_user(user_id: int, session: AsyncDatabaseSession = Depends(session.get_session)):
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    session.delete(user)
    await session.commit()
    return {"message": "User deleted successfully"}