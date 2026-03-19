from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user_schema import UserCreate
from app.crud.user_crud import create_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)