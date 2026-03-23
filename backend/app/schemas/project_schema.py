from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    team_id: int

class ProjectUpdate(BaseModel):
    name: str | None = None

class ProjectResponse(ProjectBase):
    id: int
    team_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
