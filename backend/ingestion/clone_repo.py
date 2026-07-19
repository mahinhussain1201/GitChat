import git
import os
import shutil
import hashlib
from app.config import settings

from urllib.parse import urlparse

def normalize_repo_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    
    try:
        parsed = urlparse(url)
        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) >= 2:
            owner = parts[0]
            repo = parts[1]
            if repo.endswith(".git"):
                repo = repo[:-4]
            return f"{parsed.scheme}://{parsed.netloc}/{owner}/{repo}"
    except Exception:
        pass

    # Fallback basic cleanup
    if "?" in url:
        url = url.split("?")[0]
    if "#" in url:
        url = url.split("#")[0]
    if url.endswith("/"):
        url = url[:-1]
    return url

def get_repo_id(repo_url: str) -> str:
    clean_url = normalize_repo_url(repo_url)
    return hashlib.md5(clean_url.encode()).hexdigest()

def clone_repository(repo_url: str) -> str:
    clean_url = normalize_repo_url(repo_url)
    repo_id = get_repo_id(clean_url)
    target_dir = os.path.join(settings.REPO_STORAGE_DIR, repo_id)
    
    if os.path.exists(target_dir) and os.path.exists(os.path.join(target_dir, ".git")):
        print(f"Repository {clean_url} already cloned at {target_dir}")
        return target_dir
    
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir, ignore_errors=True)

    os.makedirs(target_dir, exist_ok=True)
    try:
        env = dict(os.environ, GIT_TERMINAL_PROMPT="0")
        git.Repo.clone_from(clean_url, target_dir, depth=1, env=env)
        print(f"Successfully cloned {clean_url} to {target_dir}")
        return target_dir
    except Exception as e:
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir, ignore_errors=True)
        raise Exception(f"Failed to clone repository '{clean_url}': {str(e)}")

