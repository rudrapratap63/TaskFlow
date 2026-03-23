from fastapi import FastAPI
from app.db.database import Base, engine
from app.api.routes import user_routes, team_routes, project_routes, task_routes, comment_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(user_routes.router)
app.include_router(team_routes.router)
app.include_router(project_routes.router)
app.include_router(task_routes.router)
app.include_router(comment_routes.router)

@app.get("/")
def home():
    return {"message": "How are you doing"}