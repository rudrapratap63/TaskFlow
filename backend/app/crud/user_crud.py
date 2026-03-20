from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate
from backend.app.db import models
from backend.app.utils.hash import hash_password


def create_user(db: Session, user: UserCreate):
    hash_pwd = hash_password(user.password)
    new_user = models.User(
        name = user.name,
        email = user.email,
        username = user.username,
        password = hash_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def check_user_exist(db: Session, user: UserCreate):
    return db.query(models.User).filter(
        or_(
            models.User.email == user.email,
            models.User.username == user.username
        )
    ).first()