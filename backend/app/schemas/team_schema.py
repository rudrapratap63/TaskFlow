from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: str | None = None

class TeamResponse(TeamBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
