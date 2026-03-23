from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Comment, Task, Project, UserTeams, UserRole
from app.schemas.comment_schema import CommentCreate, CommentUpdate

async def get_user_role_for_task(db: AsyncSession, task_id: int, user_id: int) -> Optional[UserRole]:
    """Helper to verify user is a valid team member (admin/member) for the team owning the task"""
    query = (
        select(UserTeams.role)
        .join(Project, Project.team_id == UserTeams.team_id)
        .join(Task, Task.project_id == Project.id)
        .where(Task.id == task_id, UserTeams.user_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def create_comment(db: AsyncSession, comment_in: CommentCreate, user_id: int) -> Optional[Comment]:
    role = await get_user_role_for_task(db, comment_in.task_id, user_id)
    if not role: # Must be at least member
        return None

    new_comment = Comment(
        content=comment_in.content,
        task_id=comment_in.task_id,
        user_id=user_id
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    return new_comment

async def get_task_comments(db: AsyncSession, task_id: int, user_id: int, skip: int = 0, limit: int = 100) -> Optional[Sequence[Comment]]:
    role = await get_user_role_for_task(db, task_id, user_id)
    if not role: # Must be at least member
        return None

    result = await db.execute(select(Comment).where(Comment.task_id == task_id).offset(skip).limit(limit))
    return result.scalars().all()

async def update_comment(db: AsyncSession, comment_id: int, comment_in: CommentUpdate, user_id: int) -> Optional[Comment]:
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    
    if not comment:
        return None

    # Users can only edit THEIR OWN comments
    if comment.user_id != user_id:
        return None
        
    # Check if they are still part of the team
    role = await get_user_role_for_task(db, comment.task_id, user_id)
    if not role:
        return None

    comment.content = comment_in.content
    await db.commit()
    await db.refresh(comment)
    return comment

async def delete_comment(db: AsyncSession, comment_id: int, user_id: int) -> bool:
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    
    if not comment:
        return False

    role = await get_user_role_for_task(db, comment.task_id, user_id)
    if not role:
        return False

    # Admins can delete any comment. Members can only delete their own.
    if role == UserRole.ADMIN or comment.user_id == user_id:
        await db.delete(comment)
        await db.commit()
        return True
        
    return False
