from fastapi import FastAPI
from app.db.database import Base, engine
from app.api.routes import user_routes, team_routes
app = FastAPI()

@app.on_event("startup")
async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(user_routes.router)
app.include_router(team_routes.router)

@app.get("/")
def home():
    return {"message": "How are you doing"}