from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm


auth_router = APIRouter()

# @router.post("/token", response_model=Token)
# async def login_for_access_token(
#     form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
# ):
#     return auth.login_for_access_token(db, form_data)


# @router.get("/users/me/", response_model=User)
# async def read_users_me(current_user: User = Depends(auth.get_current_active_user)):
#     return current_user


# @router.get("/users/me/items/")
# async def read_own_items(current_user: User = Depends(auth.get_current_active_user)):
#     return [{"item_id": "Foo", "owner": current_user.username}]


# def hash_password(password: str) -> str:
#     if password is None:
#         raise ValueError("Password cannot be None")
#     return pwd_context.hash(password)


# @router.post("/users/", response_model=UserResponse)
# def create_user(user: User, db: Session = Depends(get_db)):
#     db_user = auth.get_user(db=db, username=user.username)

#     if db_user:
#         raise HTTPException(status_code=400, detail="Login name already registered")

#     user_in_db = UserInDB(**user.dict(), hashed_password=hash_password(user.password))
#     return service.create_user(db=db, user=user_in_db)
