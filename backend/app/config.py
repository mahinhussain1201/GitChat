import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
    LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
    LANGCHAIN_ENDPOINT = os.getenv("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
    LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "RepoMind")
    
    @property
    def CHROMA_DB_DIR(self) -> str:
        path = os.getenv("CHROMA_DB_DIR", os.path.join(os.getcwd(), "chroma_db"))
        try:
            os.makedirs(path, exist_ok=True)
            return path
        except Exception:
            fallback = "/tmp/chroma_db"
            os.makedirs(fallback, exist_ok=True)
            return fallback

    @property
    def REPO_STORAGE_DIR(self) -> str:
        path = os.getenv("REPO_STORAGE_DIR", os.path.join(os.getcwd(), "repos"))
        try:
            os.makedirs(path, exist_ok=True)
            return path
        except Exception:
            fallback = "/tmp/repos"
            os.makedirs(fallback, exist_ok=True)
            return fallback
            
    EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
    LLM_MODEL_NAME = "llama-3.1-8b-instant"

settings = Config()
