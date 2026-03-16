from backend.ingestion.clone_repo import clone_repository, get_repo_id
from backend.ingestion.file_filter import filter_files
from backend.ingestion.chunker import chunk_code
from backend.embeddings.vector_store import vector_store
import os

class RepoService:
    async def process_repository(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        
        # Check if already processed and populated in VectorStore
        if vector_store.collection_exists(repo_id):
            print(f"Repository {repo_url} already indexed. Skipping ingestion.")
            return {
                "repo_id": repo_id,
                "status": "already_indexed",
                "chunk_count": vector_store.get_item_count(repo_id)
            }
        
        # 1. Clone
        repo_path = clone_repository(repo_url)
        
        # 2. Filter
        files = filter_files(repo_path)
        
        # 3. Chunk
        chunks = chunk_code(files)
        
        # 4. Store
        vector_store.add_chunks(repo_id, chunks)
        
        return {
            "repo_id": repo_id,
            "file_count": len(files),
            "chunk_count": len(chunks)
        }
