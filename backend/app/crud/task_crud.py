from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Task, Project, UserTeams, UserRole
from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskStatusUpdate

async def get_user_role_in_project(db: AsyncSession, user_id: int, project_id: int) -> Optional[UserRole]:
    """Helper snippet to verify user role in the team owning the project"""
    query = (
        select(UserTeams.role)
        .join(Project, Project.team_id == UserTeams.team_id)
        .where(Project.id == project_id, UserTeams.user_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_task_with_role(db: AsyncSession, task_id: int, user_id: int):
    """Helper to fetch a task and the user's role in the team owning the task's project"""
    query = (
        select(Task, UserTeams.role)
        .join(Project, Project.id == Task.project_id)
        .join(UserTeams, UserTeams.team_id == Project.team_id)
        .where(Task.id == task_id, UserTeams.user_id == user_id)
    )
    result = await db.execute(query)
    row = result.first()
    if row:
        return row[0], row[1] # Task, UserRole
    return None, None

async def create_task(db: AsyncSession, task_in: TaskCreate, user_id: int) -> Optional[Task]:
    role = await get_user_role_in_project(db, user_id, task_in.project_id)
    if role != UserRole.ADMIN: # Admin check
        return None

    new_task = Task(
        title=task_in.title,
        description=task_in.description,
        deadline=task_in.deadline,
        project_id=task_in.project_id,
        assigned_user_id=task_in.assigned_user_id
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

async def get_project_tasks(db: AsyncSession, project_id: int, user_id: int, skip: int = 0, limit: int = 100) -> Optional[Sequence[Task]]:
    role = await get_user_role_in_project(db, user_id, project_id)
    if not role: # Must at least be a member
        return None

    result = await db.execute(select(Task).where(Task.project_id == project_id).offset(skip).limit(limit))
    return result.scalars().all()

async def get_assigned_tasks(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> Sequence[Task]:
    result = await db.execute(select(Task).where(Task.assigned_user_id == user_id).offset(skip).limit(limit))
    return result.scalars().all()

async def update_task(db: AsyncSession, task_id: int, task_in: TaskUpdate, user_id: int) -> Optional[Task]:
    task, role = await get_task_with_role(db, task_id, user_id)
    if not task or role != UserRole.ADMIN: # Admin check
        return None

    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    await db.commit()
    await db.refresh(task)
    return task

async def update_task_status(db: AsyncSession, task_id: int, status_in: TaskStatusUpdate, user_id: int) -> Optional[Task]:
    task, role = await get_task_with_role(db, task_id, user_id)
    if not task or not role: # Allows ADMIN or MEMBER
        return None

    task.status = status_in.status
    await db.commit()
    await db.refresh(task)
    return task

async def delete_task(db: AsyncSession, task_id: int, user_id: int) -> bool:
    task, role = await get_task_with_role(db, task_id, user_id)
    if not task or role != UserRole.ADMIN: # Admin check
        return False

    await db.delete(task)
    await db.commit()
    return True
