from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CommentBase(BaseModel):
    content: str
    task_id: int

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
