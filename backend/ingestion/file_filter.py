import os

IGNORE_DIRS = {
    '.git', 'node_modules', 'dist', 'build', 'venv', '.venv', 
    '__pycache__', '.next', '.pytest_cache', '.vscode', '.idea',
    'static', 'assets', 'vendor', 'plugins', 'tinymce'
}

ALLOWED_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', '.hpp',
    '.go', '.rs', '.json', '.yaml', '.yml', '.md', '.sql', '.html', '.css',
    '.sh', '.bash', '.zsh', '.kt', '.cs', '.php', '.rb', '.swift', '.m', '.mm',
    '.dockerfile', '.toml', '.env', '.xml', '.gradle', 'dockerfile'
}

def should_ignore(path: str) -> bool:
    parts = path.split(os.sep)
    if any(part in IGNORE_DIRS for part in parts):
        return True
    return False

def is_allowed_file(filename: str) -> bool:
    lower_name = filename.lower()
    if lower_name.startswith('.'):
        return lower_name == 'dockerfile' or lower_name.endswith(('.yml', '.yaml', '.json', '.toml', '.env'))
    if lower_name.endswith(('.min.js', '.min.css', '.map', '.lock')):
        return False
    if lower_name == 'dockerfile':
        return True
    ext = os.path.splitext(lower_name)[1]
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
