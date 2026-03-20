from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select, update
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

async def change_team_name(team_id: int, new_name: str, db: AsyncSession, user_id: int):
    # Check if user is an admin of the team
    stmt = select(UserTeams).where(
        UserTeams.user_id == user_id,
        UserTeams.team_id == team_id,
        UserTeams.role == UserRole.ADMIN
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        return None

    # Fetch and update the team
    query = select(Team).where(Team.id == team_id)
    result = await db.execute(query)
    team = result.scalars().first()
    
    if team:
        team.name = new_name
        await db.commit()
        await db.refresh(team)
    
    return team