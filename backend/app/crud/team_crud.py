from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Team, UserTeams, UserRole
from app.schemas.team_schema import TeamCreate

async def create_new_team(db: AsyncSession, team_in: TeamCreate, user_id: int):
    # Create the team
    new_team = Team(
        name=team_in.name,
        created_by=user_id
    )
    db.add(new_team)
    await db.flush()

    # Add the creator as an admin member of the team
    user_team = UserTeams(
        user_id=user_id,
        team_id=new_team.id,
        role=UserRole.ADMIN
    )
    db.add(user_team)
    
    await db.commit()
    await db.refresh(new_team)
    
    return new_team

async def get_all_teams(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = select(Team).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_user_teams(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    query = (
        select(Team)
        .join(UserTeams)
        .where(UserTeams.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()
