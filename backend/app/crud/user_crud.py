from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate
from backend.app.db import models


def create_user(db: Session, user: UserCreate):
    
    new_user = models.User(
        name = user.name,
        email = user.email,
        username = user.username,
        password = user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user