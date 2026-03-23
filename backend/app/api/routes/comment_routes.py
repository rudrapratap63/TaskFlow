from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.schemas.comment_schema import CommentCreate, CommentResponse, CommentUpdate
from app.crud import comment_crud
from app.db.models import User

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_comment(
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = await comment_crud.create_comment(db=db, comment_in=comment_in, user_id=current_user.id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to post comments on this task"
        )
    return comment

@router.get("/task/{task_id}", response_model=List[CommentResponse])
async def read_task_comments(
    task_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comments = await comment_crud.get_task_comments(db=db, task_id=task_id, user_id=current_user.id, skip=skip, limit=limit)
    if comments is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to view comments for this task"
        )
    return comments

@router.patch("/{comment_id}", response_model=CommentResponse)
async def map_update_comment(
    comment_id: int,
    comment_in: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = await comment_crud.update_comment(db=db, comment_id=comment_id, comment_in=comment_in, user_id=current_user.id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Comment not found or you can only edit your own comments"
        )
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment_data(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await comment_crud.delete_comment(db=db, comment_id=comment_id, user_id=current_user.id)
    if not success:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Comment not found or you don't have permission to delete it"
        )
