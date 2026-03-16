import chromadb
from chromadb.config import Settings
from backend.app.config import settings
from typing import List, Dict
import uuid

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        
    def get_or_create_collection(self, repo_id: str):
        return self.client.get_or_create_collection(name=f"repo_{repo_id}")
    
    def add_chunks(self, repo_id: str, chunks: List[Dict]):
        collection = self.get_or_create_collection(repo_id)
        
        documents = [c["content"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        ids = [str(uuid.uuid4()) for _ in range(len(chunks))]
        
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
    def query(self, repo_id: str, query_text: str, n_results: int = 5):
        collection = self.get_or_create_collection(repo_id)
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results

    def collection_exists(self, repo_id: str) -> bool:
        try:
            # Check if collection exists and has documents
            collection = self.client.get_collection(name=f"repo_{repo_id}")
            return collection.count() > 0
        except Exception:
            return False

    def get_item_count(self, repo_id: str) -> int:
        try:
            collection = self.client.get_collection(name=f"repo_{repo_id}")
            return collection.count()
        except Exception:
            return 0

vector_store = VectorStore()
