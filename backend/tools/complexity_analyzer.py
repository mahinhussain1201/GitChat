import os
import re
import json

class ComplexityAnalyzer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.weights = {
            "cyclomatic": 0.25,
            "cognitive": 0.20,
            "loc": 0.10,
            "nesting": 0.10,
            "dependency": 0.10,
            "modularity": 0.10,
            "duplication": 0.05,
            "maintainability": 0.10
        }

    def analyze(self):
        file_metrics = []
        total_score = 0
        all_functions = []

        for root, dirs, files in os.walk(self.repo_path):
            if any(p in root for p in [".git", "node_modules", "vendor", "__pycache__"]):
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.repo_path)
                
                if file.endswith((".py", ".js", ".ts", ".tsx")):
                    metrics, functions = self._analyze_file(file_path, rel_path)
                    file_metrics.append(metrics)
                    all_functions.extend(functions)

        if not file_metrics:
            return {"error": "No source files found for analysis."}

        # Calculate Repository Complexity Score
        avg_cyclomatic = sum(m["cyclomatic"] for m in file_metrics) / len(file_metrics)
        avg_cognitive = sum(m["cognitive"] for m in file_metrics) / len(file_metrics)
        avg_loc = sum(m["loc"] for m in file_metrics) / len(file_metrics)
        avg_nesting = sum(m["nesting"] for m in file_metrics) / len(file_metrics)
        avg_dep = sum(m["dependency"] for m in file_metrics) / len(file_metrics)
        avg_mod = sum(m["modularity"] for m in file_metrics) / len(file_metrics)
        avg_dup = sum(m["duplication"] for m in file_metrics) / len(file_metrics)
        avg_maint = sum(m["maintainability"] for m in file_metrics) / len(file_metrics)

        repo_score = (
            self._normalize(avg_cyclomatic, 20) * self.weights["cyclomatic"] +
            self._normalize(avg_cognitive, 30) * self.weights["cognitive"] +
            self._normalize(avg_loc, 500) * self.weights["loc"] +
            self._normalize(avg_nesting, 5) * self.weights["nesting"] +
            self._normalize(avg_dep, 15) * self.weights["dependency"] +
            self._normalize(avg_mod, 10, inverse=True) * self.weights["modularity"] +
            self._normalize(avg_dup, 20) * self.weights["duplication"] +
            self._normalize(avg_maint, 100, inverse=True) * self.weights["maintainability"]
        )

        heatmap = []
        for m in file_metrics:
            score = (m["cyclomatic"] * 5 + m["cognitive"] * 2 + m["nesting"] * 10 + (m["loc"]/300)*20)
            score = min(100, score)
            heatmap.append({
                "file": m["file"],
                "score": int(score),
                "category": "🔴 High" if score > 60 else "🟡 Moderate" if score > 30 else "🟢 Low"
            })

        # Sort top 10 functions
        sorted_functions = sorted(all_functions, key=lambda x: x["complexity"], reverse=True)[:10]

        return {
            "final_score": max(0, int(repo_score)),
            "heatmap": heatmap,
            "top_functions": sorted_functions,
            "details": {
                "Logic Flow Complexity": max(0, int(self._normalize(avg_cyclomatic, 50, inverse=True))),
                "Structural Health": max(0, int(self._normalize(avg_cognitive, 100, inverse=True))),
                "Code Logic Density": max(0, int(self._normalize(avg_loc, 1000, inverse=True)))
            }
        }

    def _normalize(self, value, max_val, inverse=False):
        score = min(100, (value / max_val) * 100)
        return (100 - score) if inverse else score

    def _analyze_file(self, file_path, rel_path):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.splitlines()

            # Cyclomatic Complexity (simplified)
            cycle_patterns = [r'\bif\b', r'\belse\b', r'\bfor\b', r'\bwhile\b', r'\bcase\b', r'\bexcept\b', r'\btry\b', r'&&', r'\|\|']
            cyclomatic = sum(len(re.findall(p, content)) for p in cycle_patterns)

            # Cognitive Complexity (simplified nesting check)
            cognitive = 0
            max_nesting = 0
            for line in lines:
                nesting = (len(line) - len(line.lstrip())) // 4 # Assuming 4 spaces
                if nesting > max_nesting: max_nesting = nesting
                if nesting > 1: cognitive += (nesting - 1)

            # Dependency Complexity
            deps = len(re.findall(r'^(import|from|require)', content, re.MULTILINE))

            # Maintainability (Heuristics)
            # Naming clarity: check for very short variable names (placeholder check)
            short_names = len(re.findall(r'\b[a-z]\b', content))
            maint = 100 - min(40, short_names * 2)

            functions = self._extract_functions(lines, rel_path)

            metrics = {
                "file": rel_path,
                "cyclomatic": cyclomatic,
                "cognitive": cognitive,
                "loc": len(lines),
                "nesting": max_nesting,
                "dependency": deps,
                "modularity": 5, # Placeholder
                "duplication": 2, # Placeholder
                "maintainability": maint
            }

            return metrics, functions
        except Exception:
            return {}, []

    def _extract_functions(self, lines, rel_path):
        funcs = []
        for i, line in enumerate(lines):
            # Python def or JS/TS function/arrow
            match = re.search(r'(?:def|function|const|let)\s+(\w+)\s*[\(=]', line)
            if match:
                name = match.group(1)
                # Estimate complexity for function
                # (Look ahead for next 50 lines to see nesting)
                func_lines = lines[i:i+50]
                nesting = 0
                for fl in func_lines:
                    n = (len(fl) - len(fl.lstrip())) // 4
                    if n > nesting: nesting = n
                
                funcs.append({
                    "name": name,
                    "file": rel_path,
                    "cyclomatic": len(re.findall(r'if|for|while', "".join(func_lines))),
                    "nesting_depth": nesting,
                    "complexity": nesting * 5 + len(re.findall(r'if|for|while', "".join(func_lines))) * 2,
                    "why": f"High nesting depth ({nesting}) and multiple decision points."
                })
        return funcs

def run_complexity_analysis(repo_path: str):
    analyzer = ComplexityAnalyzer(repo_path)
    return analyzer.analyze()
