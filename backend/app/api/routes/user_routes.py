from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user_schema import UserCreate
from app.crud.user_crud import check_user_exist, create_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    is_user_exist = check_user_exist(db, user)

    if is_user_exist:
        raise HTTPException(409, detail="Username or email already exist")
    return create_user(db, user)

