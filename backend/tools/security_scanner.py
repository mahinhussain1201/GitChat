import os
import re
import json

class SecurityScanner:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.secret_patterns = {
            "Generic API Key": r'(?:key|api|token|secret|pwd|password)[-_]?[a-zA-Z0-9]{16,}',
            "AWS Access Key": r'AKIA[0-9A-Z]{16}',
            "AWS Secret Key": r'secret_key|aws_secret|aws_key',
            "GitHub Token": r'ghp_[a-zA-Z0-9]{36}',
            "Slack Token": r'xox[baprs]-[0-9a-zA-Z]{10,48}',
            "Google Cloud Key": r'AIza[0-9A-Za-z-_]{35}',
            "Firebase Key": r'AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140}'
        }
        self.unsafe_patterns = {
            "Shell Injection (eval)": r'eval\(.*\)',
            "Shell Injection (os.system)": r'os\.system\(.*\)',
            "Shell Injection (subprocess.Popen)": r'subprocess\.Popen\(.*shell=True.*\)',
            "Insecure Pickle": r'pickle\.loads\(.*\)',
            "Insecure YAML": r'yaml\.load\(.*Loader=yaml\.Loader.*\)',
            "Insecure URL Request": r'requests\.get\(.*verify=False.*\)',
            "Hardcoded Bind": r'bind\(.*0\.0\.0\.0.*\)'
        }

    def scan(self):
        results = {
            "secrets": [],
            "vulnerable_dependencies": [],
            "unsafe_patterns": []
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            if any(p in root for p in [".git", "node_modules", "vendor", "__pycache__"]):
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.repo_path)
                
                # Scan for secrets and unsafe patterns
                if file.endswith((".py", ".js", ".ts", ".tsx", ".env", ".yaml", ".yml", ".json")):
                    self._scan_content(file_path, rel_path, results)
                
                # Scan for dependencies
                if file == "requirements.txt":
                    self._scan_python_deps(file_path, results)
                elif file == "package.json":
                    self._scan_node_deps(file_path, results)
                    
        return results

    def _scan_content(self, file_path, rel_path, results):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Secret scan
            for name, pattern in self.secret_patterns.items():
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    results["secrets"].append({
                        "type": name,
                        "file": rel_path,
                        "line": content.count('\n', 0, match.start()) + 1,
                        "snippet": match.group(0)[:20] + "..."
                    })
            
            # Unsafe pattern scan
            for name, pattern in self.unsafe_patterns.items():
                matches = re.finditer(pattern, content)
                for match in matches:
                    results["unsafe_patterns"].append({
                        "type": name,
                        "file": rel_path,
                        "line": content.count('\n', 0, match.start()) + 1,
                        "snippet": match.group(0)
                    })
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")

    def _scan_python_deps(self, file_path, results):
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        # Dummy vulnerability check for example
                        if "flask" in line.lower() and "==" in line:
                            version = line.split("==")[1]
                            if version < "2.3.0":
                                results["vulnerable_dependencies"].append({
                                    "package": "flask",
                                    "version": version,
                                    "severity": "High",
                                    "info": "Upgrade to >=2.3.0 to fix security vulnerabilities."
                                })
                        if "requests" in line.lower() and "==" in line:
                            version = line.split("==")[1]
                            if version < "2.31.0":
                                results["vulnerable_dependencies"].append({
                                    "package": "requests",
                                    "version": version,
                                    "severity": "Medium",
                                    "info": "Upgrade to >=2.31.0 for updated certifi."
                                })
        except Exception as e:
            print(f"Error scanning python deps {file_path}: {e}")

    def _scan_node_deps(self, file_path, results):
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                
                # Example known vulnerable packages
                vulnerable = {
                    "lodash": {"version": "4.17.21", "info": "Prototype pollution vulnerability."},
                    "axios": {"version": "1.6.0", "info": "SSRF vulnerability in older versions."},
                    "express": {"version": "4.18.0", "info": "Various vulnerabilities fix in 4.18.2+"}
                }
                
                for pkg, version in deps.items():
                    clean_version = version.replace("^", "").replace("~", "")
                    if pkg in vulnerable:
                        if clean_version < vulnerable[pkg]["version"]:
                            results["vulnerable_dependencies"].append({
                                "package": pkg,
                                "version": version,
                                "severity": "High",
                                "info": vulnerable[pkg]["info"]
                            })
        except Exception as e:
            print(f"Error scanning node deps {file_path}: {e}")

def run_security_scan(repo_path: str):
    scanner = SecurityScanner(repo_path)
    return scanner.scan()
