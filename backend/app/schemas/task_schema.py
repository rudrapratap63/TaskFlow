from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.db.models import TaskStatus

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    project_id: int
    assigned_user_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    assigned_user_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskResponse(TaskBase):
    id: int
    project_id: int
    assigned_user_id: Optional[int]
    status: TaskStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
