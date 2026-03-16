import os

IGNORE_DIRS = {
    '.git', 'node_modules', 'dist', 'build', 'venv', '.venv', 
    '__pycache__', '.next', '.pytest_cache', '.vscode', '.idea'
}

ALLOWED_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', 
    '.go', '.rs', '.json', '.yaml', '.yml', '.md', '.sql', 'Dockerfile'
}

def should_ignore(path: str) -> bool:
    parts = path.split(os.sep)
    if any(part in IGNORE_DIRS for part in parts):
        return True
    return False

def is_allowed_file(filename: str) -> bool:
    if filename.startswith('.'):
        return filename == 'Dockerfile' or filename.endswith(('.yml', '.yaml', '.json'))
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def filter_files(repo_path: str):
    relevant_files = []
    for root, dirs, files in os.walk(repo_path):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if is_allowed_file(file):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, repo_path)
                relevant_files.append({
                    "full_path": full_path,
                    "rel_path": rel_path
                })
    return relevant_files
