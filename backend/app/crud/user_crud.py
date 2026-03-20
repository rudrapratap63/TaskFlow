from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user_schema import LoginRequest, UserCreate
from app.db import models
from app.utils.hash import hash_password


async def create_user(db: AsyncSession, user: UserCreate):
    hash_pwd = hash_password(user.password)
    new_user = models.User(
        name = user.name,
        email = user.email,
        username = user.username,
        password = hash_pwd
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

async def check_user_exist(db: AsyncSession, user: UserCreate | LoginRequest):

    if isinstance(user, UserCreate):
        stmt = select(models.User).where(
            or_(
                models.User.email == user.email,
                models.User.username == user.username
            )
        )
    else:
        stmt = select(models.User).where(models.User.email == user.email)

    result = await db.execute(stmt)

    users = result.scalars().first()
    return users