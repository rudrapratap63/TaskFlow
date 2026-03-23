from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.project_schema import ProjectCreate, ProjectResponse, ProjectUpdate
from app.crud.project_crud import (
    create_new_project, 
    get_team_projects, 
    get_project_by_id, 
    update_project, 
    delete_project
)
from app.db.models import User

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = await create_new_project(db=db, project_in=project_in, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to create project for this team (Admin only)"
        )
    return project

@router.get("/team/{team_id}", response_model=List[ProjectResponse])
async def read_team_projects(
    team_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_team_projects(db=db, team_id=team_id, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = await get_project_by_id(db=db, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found or access denied"
        )
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project_details(
    project_id: int,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = await update_project(db=db, project_id=project_id, project_in=project_in, user_id=current_user.id)
    if not project:
        raise HTTPException(
            status_code=403,
            detail="Project not found, or you don't have permission (Admin only)"
        )
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_data(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await delete_project(db=db, project_id=project_id, user_id=current_user.id)
    if not success:
         raise HTTPException(
            status_code=403, 
            detail="Project not found, or you don't have permission (Admin only)"
        )
