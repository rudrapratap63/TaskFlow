from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.team_schema import TeamCreate, TeamResponse, TeamUpdate
from app.crud.team_crud import change_team_name, create_new_team, get_all_teams, get_user_teams
from app.db.models import User

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)

@router.post("/", response_model=TeamResponse)
async def create_team(
    team_in: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_new_team(db=db, team_in=team_in, user_id=current_user.id)

@router.get("/", response_model=List[TeamResponse])
async def read_teams(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_user_teams(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.patch("/{team_id}", response_model=TeamResponse)
async def change_name(
    team_id: int,
    team_in: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team_updated = await change_team_name(
        team_id=team_id,
        new_name=team_in.name,
        db=db,
        user_id=current_user.id
    )

    if not team_updated:
        raise HTTPException(
            status_code=404, 
            detail="Team not found or you don't have permission to edit it"
        )
    
    return team_updated