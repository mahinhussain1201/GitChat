import git
import os
import shutil
import hashlib
from backend.app.config import settings

def get_repo_id(repo_url: str) -> str:
    return hashlib.md5(repo_url.encode()).hexdigest()

def clone_repository(repo_url: str) -> str:
    repo_id = get_repo_id(repo_url)
    target_dir = os.path.join(settings.REPO_STORAGE_DIR, repo_id)
    
    if os.path.exists(target_dir):
        print(f"Repository {repo_url} already cloned at {target_dir}")
        return target_dir
    
    os.makedirs(target_dir, exist_ok=True)
    try:
        git.Repo.clone_from(repo_url, target_dir, depth=1)
        print(f"Successfully cloned {repo_url} to {target_dir}")
        return target_dir
    except Exception as e:
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir)
        raise Exception(f"Failed to clone repository: {str(e)}")
