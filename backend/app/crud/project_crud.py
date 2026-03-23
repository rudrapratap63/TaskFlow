from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.models import Project, UserTeams, UserRole
from app.schemas.project_schema import ProjectCreate, ProjectUpdate

async def create_new_project(db: AsyncSession, project_in: ProjectCreate, user_id: int) :
    result = await db.execute(
        select(UserTeams).where(
            UserTeams.user_id == user_id,
            UserTeams.team_id == project_in.team_id,
            UserTeams.role == UserRole.ADMIN
        )
    )
    if not result.scalars().first():
        return None

    new_project = Project(
        name=project_in.name,
        team_id=project_in.team_id,
        created_by=user_id
    )
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project

async def get_team_projects(db: AsyncSession, team_id: int, user_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(UserTeams).where(
            UserTeams.user_id == user_id,
            UserTeams.team_id == team_id
        )
    )
    if not result.scalars().first():
        return []

    result = await db.execute(
        select(Project)
        .where(Project.team_id == team_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_project_by_id(db: AsyncSession, project_id: int, user_id: int):
    query = (
        select(Project)
        .join(UserTeams, (UserTeams.team_id == Project.team_id) & (UserTeams.user_id == user_id))
        .where(Project.id == project_id)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def update_project(db: AsyncSession, project_id: int, project_in: ProjectUpdate, user_id: int):
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return None

    result = await db.execute(
        select(UserTeams).where(
            UserTeams.user_id == user_id,
            UserTeams.team_id == project.team_id,
            UserTeams.role == UserRole.ADMIN
        )
    )
    if not result.scalars().first():
        return None

async def delete_project(db: AsyncSession, project_id: int, user_id: int) -> bool:
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return False
    
    result = await db.execute(
        select(UserTeams).where(
            UserTeams.user_id == user_id,
            UserTeams.team_id == project.team_id,
            UserTeams.role == UserRole.ADMIN
        )
    )
    if not result.scalars().first():
        return False

    await db.delete(project)
    await db.commit()
    return True
