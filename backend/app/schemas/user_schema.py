from pydantic import BaseModel, ConfigDict, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    name: str
    
    model_config = ConfigDict(from_attributes=True)