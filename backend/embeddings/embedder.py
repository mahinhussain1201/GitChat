from sentence_transformers import SentenceTransformer
from backend.app.config import settings

class Embedder:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        
    def embed_text(self, texts: list[str]):
        return self.model.encode(texts).tolist()

embedder = Embedder()
