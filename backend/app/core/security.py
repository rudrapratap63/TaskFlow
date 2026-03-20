from jose import jwt
from datetime import datetime, timedelta, timezone

from app.core.config import settings

def create_access_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.now(timezone.utc) + timedelta(float(settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt