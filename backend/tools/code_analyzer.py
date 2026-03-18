import os
import re
import json

class CodeAnalyzer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.bad_practices_patterns = {
            "Bare except": r'except:',
            "Print statement": r'(?<!\.)\bprint\(',
            "Global variable": r'^global\s+\w+',
            "Mutable default argument": r'def\s+\w+\(.*=\[\]|{}.*\):',
            "Hardcoded path": r'[\"\'](?:/|C:\\)[a-zA-Z0-9\-_/ ]+[\"\']'
        }

    def analyze(self):
        results = {
            "unused_imports": [],
            "code_smells": [],
            "duplicate_code": [],
            "bad_practices": []
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            if any(p in root for p in [".git", "node_modules", "vendor", "__pycache__"]):
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.repo_path)
                
                if file.endswith(".py"):
                    self._analyze_python_file(file_path, rel_path, results)
                elif file.endswith((".js", ".ts", ".tsx")):
                    self._analyze_js_file(file_path, rel_path, results)
                    
        return results

    def _analyze_python_file(self, file_path, rel_path, results):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.splitlines()

            # 1. Unused imports (Very basic detection)
            imports = re.findall(r'^(?:import|from)\s+(\w+)', content, re.MULTILINE)
            for imp in imports:
                # Count occurrences of the imported name, excluding the import line itself
                # This is a heuristic and might have false positives
                usage_count = len(re.findall(rf'\b{imp}\b', content))
                if usage_count <= 1:
                    results["unused_imports"].append({
                        "file": rel_path,
                        "import": imp
                    })

            # 2. Code Smells
            # Long functions
            func_starts = [i for i, line in enumerate(lines) if line.strip().startswith("def ")]
            for i, start_idx in enumerate(func_starts):
                end_idx = func_starts[i+1] if i+1 < len(func_starts) else len(lines)
                length = end_idx - start_idx
                if length > 50:
                    func_name = re.search(r'def\s+(\w+)', lines[start_idx]).group(1)
                    results["code_smells"].append({
                        "type": "Long Function",
                        "file": rel_path,
                        "line": start_idx + 1,
                        "detail": f"Function '{func_name}' is too long ({length} lines)."
                    })
            
            # Excessive arguments
            for i, line in enumerate(lines):
                if line.strip().startswith("def "):
                    arg_match = re.search(r'def\s+\w+\((.*?)\):', line)
                    if arg_match:
                        args = [a.strip() for a in arg_match.group(1).split(",") if a.strip()]
                        if len(args) > 5:
                            func_name = re.search(r'def\s+(\w+)', line).group(1)
                            results["code_smells"].append({
                                "type": "Excessive Arguments",
                                "file": rel_path,
                                "line": i + 1,
                                "detail": f"Function '{func_name}' has too many arguments ({len(args)})."
                            })

            # 3. Bad Practices
            for name, pattern in self.bad_practices_patterns.items():
                matches = re.finditer(pattern, content, re.MULTILINE)
                for match in matches:
                    results["bad_practices"].append({
                        "type": name,
                        "file": rel_path,
                        "line": content.count('\n', 0, match.start()) + 1,
                        "snippet": match.group(0).strip()
                    })

            # 4. Duplicate Code (Basic line duplication within file)
            seen_lines = {}
            for i, line in enumerate(lines):
                line = line.strip()
                if len(line) > 20: # Only check lines longer than 20 chars
                    if line in seen_lines:
                        results["duplicate_code"].append({
                            "file": rel_path,
                            "line": i + 1,
                            "original_line": seen_lines[line] + 1,
                            "content": line[:50] + "..."
                        })
                    else:
                        seen_lines[line] = i

        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")

    def _analyze_js_file(self, file_path, rel_path, results):
        # Similar logic for JS/TS
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.splitlines()

            # 1. Unused imports (Basic)
            imports = re.findall(r'import\s+\{?(\w+)\}?\s+from', content)
            for imp in imports:
                usage_count = len(re.findall(rf'\b{imp}\b', content))
                if usage_count <= 1:
                    results["unused_imports"].append({
                        "file": rel_path,
                        "import": imp
                    })

            # 2. Bad Practices
            js_bad_practices = {
                "Console Log": r'console\.log\(',
                "Eval usage": r'\beval\(',
                "Var usage": r'\bvar\s+\w+',
                "Magic numbers": r'(?<![a-zA-Z0-9_])\b(?:1000|60000|86400)\b'
            }
            for name, pattern in js_bad_practices.items():
                matches = re.finditer(pattern, content)
                for match in matches:
                    results["bad_practices"].append({
                        "type": name,
                        "file": rel_path,
                        "line": content.count('\n', 0, match.start()) + 1,
                        "snippet": match.group(0).strip()
                    })

        except Exception as e:
            print(f"Error analyzing JS {file_path}: {e}")

def run_code_analysis(repo_path: str):
    analyzer = CodeAnalyzer(repo_path)
    return analyzer.analyze()
