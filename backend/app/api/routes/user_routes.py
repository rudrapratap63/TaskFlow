from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.user_schema import UserCreate, LoginRequest, UserResponse, Token
from app.crud.user_crud import check_user_exist, create_user
from app.core.security import create_access_token

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    is_user_exist = await check_user_exist(db, user)
    if is_user_exist:
        raise HTTPException(409, detail="Username or email already exist")
    return await create_user(db, user)

@router.post("/signin", response_model=Token)
async def signin(user: LoginRequest, db: AsyncSession = Depends(get_db)):
    is_user_exist = await check_user_exist(db, user)

    if not is_user_exist:
        raise HTTPException(404, detail="User not found")
    
    access_token = create_access_token(
        data={
            "id": is_user_exist.id,
            "email": is_user_exist.email,
            "username": is_user_exist.username 
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}