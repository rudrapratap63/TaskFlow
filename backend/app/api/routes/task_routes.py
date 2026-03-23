from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.task_schema import TaskCreate, TaskResponse, TaskUpdate, TaskStatusUpdate
from app.crud import task_crud
from app.db.models import User

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_new_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await task_crud.create_task(db=db, task_in=task_in, user_id=current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to create task in this project (Admin only) or invalid project"
        )
    return task

@router.get("/project/{project_id}", response_model=List[TaskResponse])
async def read_project_tasks(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = await task_crud.get_project_tasks(db=db, project_id=project_id, user_id=current_user.id, skip=skip, limit=limit)
    if tasks is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to view tasks for this project"
        )
    return tasks

@router.get("/assigned", response_model=List[TaskResponse])
async def read_my_assigned_tasks(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await task_crud.get_assigned_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task_details(
    task_id: int,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await task_crud.update_task(db=db, task_id=task_id, task_in=task_in, user_id=current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Task not found or you don't have permission (Admin only)"
        )
    return task

@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status_only(
    task_id: int,
    status_in: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Both Admin and Members can update status
    task = await task_crud.update_task_status(db=db, task_id=task_id, status_in=status_in, user_id=current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Task not found or you don't have permission"
        )
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_data(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await task_crud.delete_task(db=db, task_id=task_id, user_id=current_user.id)
    if not success:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Task not found, or you don't have permission (Admin only)"
        )
