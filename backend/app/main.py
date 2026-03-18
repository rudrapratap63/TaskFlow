from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "How are you doing"}