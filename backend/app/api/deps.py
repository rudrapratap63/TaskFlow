from app.db.database import AsyncSessionLocal, AsyncSession
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None] :
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()