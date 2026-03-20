from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import or_, select

from app.db.database import AsyncSessionLocal, AsyncSession
from typing import AsyncGenerator

from app.core.config import settings
from app.crud.user_crud import check_user_exist
from app.db import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

async def get_db() -> AsyncGenerator[AsyncSession, None] :
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        401,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        print(payload)
        email = payload.get("email")
        username = payload.get("username")

        if email is None or username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    stmt = select(models.User).where(
            or_(
                models.User.email == email,
                models.User.username == username
            )
        )

    result = await db.execute(stmt)

    user = result.scalars().first()

    if user is None:
        raise credentials_exception
    
    return user