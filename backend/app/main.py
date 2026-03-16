from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from backend.services.repo_service import RepoService
from backend.services.chat_service import ChatService

app = FastAPI(title="RepoMind API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "RepoMind API is running"}

repo_service = RepoService()
chat_service = ChatService()

class RepoRequest(BaseModel):
    repo_url: str

class ChatRequest(BaseModel):
    repo_url: str
    message: str

@app.post("/analyze-repo")
async def analyze_repo(request: RepoRequest, background_tasks: BackgroundTasks):
    try:
        # We'll implement non-blocking analysis soon
        # For now, let's keep it simple
        result = await repo_service.process_repository(request.repo_url)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = await chat_service.chat(request.repo_url, request.message)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tech-summary")
async def tech_summary(request: RepoRequest):
    try:
        response = await chat_service.get_summary(request.repo_url, type="technical")
        return {"status": "success", "summary": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/non-tech-summary")
async def non_tech_summary(request: RepoRequest):
    try:
        response = await chat_service.get_summary(request.repo_url, type="business")
        return {"status": "success", "summary": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/architecture")
async def architecture(request: RepoRequest):
    try:
        response = await chat_service.get_architecture(request.repo_url)
        return {"status": "success", "architecture": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/system-design")
async def system_design(request: RepoRequest):
    try:
        response = await chat_service.get_system_design(request.repo_url)
        return {"status": "success", "system_design": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
