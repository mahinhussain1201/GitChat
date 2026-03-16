from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict

def chunk_code(files: List[Dict[str, str]], chunk_size: int = 800, chunk_overlap: int = 100) -> List[Dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False
    )
    
    chunks = []
    for file_info in files:
        try:
            with open(file_info["full_path"], 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            file_chunks = splitter.split_text(content)
            
            for i, chunk_text in enumerate(file_chunks):
                chunks.append({
                    "content": chunk_text,
                    "metadata": {
                        "file_path": file_info["rel_path"],
                        "chunk_id": i
                    }
                })
        except Exception as e:
            print(f"Error chunking file {file_info['rel_path']}: {str(e)}")
            
    return chunks
