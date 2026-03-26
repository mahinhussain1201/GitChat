import os
import ast
import math
from collections import Counter, defaultdict

class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.complexity = 1

    def visit_If(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_For(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_While(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_Try(self, node):
        self.complexity += len(node.handlers)
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        self.complexity += len(node.values) - 1
        self.generic_visit(node)


class ProductionComplexityAnalyzer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.file_metrics = []
        self.functions = []
        self.duplication_score = 0
        self.total_files = 0
        self.parsed_files = 0

    def analyze(self):
        for root, dirs, files in os.walk(self.repo_path):
            if any(p in root for p in [".git", "node_modules", "__pycache__"]):
                continue

            for file in files:
                if file.endswith(".py"):
                    self.total_files += 1
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, self.repo_path)

                    metrics = self._analyze_python_file(file_path, rel_path)
                    if metrics:
                        self.parsed_files += 1
                        self.file_metrics.append(metrics)

        if not self.file_metrics:
            return self._empty_response()

        return self._build_final_response()

    # ---------------- FILE ANALYSIS ---------------- #

    def _analyze_python_file(self, file_path, rel_path):
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            tree = ast.parse(content)
            lines = content.splitlines()

            functions = self._extract_functions(tree, rel_path, lines)
            duplication = self._detect_duplication(lines)

            loc = len(lines)
            avg_complexity = sum(f["cyclomatic"] for f in functions) / max(1, len(functions))

            halstead = self._halstead_estimate(content)
            maintainability = self._maintainability_index(loc, avg_complexity, halstead)

            code_smells = self._detect_code_smells(functions, loc)

            self.functions.extend(functions)

            return {
                "file": rel_path,
                "loc": loc,
                "avg_cyclomatic": avg_complexity,
                "duplication": duplication,
                "maintainability": maintainability,
                "functions": functions,
                "code_smells": code_smells
            }

        except Exception:
            return None

    # ---------------- FUNCTION ANALYSIS ---------------- #

    def _extract_functions(self, tree, file_path, lines):
        functions = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                visitor = ComplexityVisitor()
                visitor.visit(node)

                start = node.lineno - 1
                end = getattr(node, "end_lineno", start + 1)
                func_lines = lines[start:end]

                nesting = self._calculate_nesting(func_lines)

                functions.append({
                    "name": node.name,
                    "file": file_path,
                    "cyclomatic": visitor.complexity,
                    "loc": len(func_lines),
                    "nesting": nesting,
                    "complexity": visitor.complexity + nesting * 2,
                    "why": f"Cyclomatic={visitor.complexity}, Nesting={nesting}"
                })

        return functions

    def _calculate_nesting(self, lines):
        max_nesting = 0
        for line in lines:
            indent = (len(line) - len(line.lstrip())) // 4
            max_nesting = max(max_nesting, indent)
        return max_nesting

    # ---------------- METRICS ---------------- #

    def _detect_duplication(self, lines):
        chunks = ["".join(lines[i:i+5]) for i in range(len(lines) - 5)]
        freq = Counter(chunks)
        return sum(v for v in freq.values() if v > 1)

    def _halstead_estimate(self, content):
        operators = len([c for c in content if c in "+-*/=<>!&|"])
        operands = len(content.split())
        return operators + operands

    def _maintainability_index(self, loc, cyclomatic, halstead):
        try:
            return max(0, int(
                171
                - 5.2 * math.log(max(1, halstead))
                - 0.23 * cyclomatic
                - 16.2 * math.log(max(1, loc))
            ))
        except:
            return 50

    def _detect_code_smells(self, functions, loc):
        smells = []

        if loc > 1000:
            smells.append("Large file")

        for f in functions:
            if f["loc"] > 50:
                smells.append(f"Long function: {f['name']}")
            if f["nesting"] > 4:
                smells.append(f"Deep nesting: {f['name']}")
            if f["cyclomatic"] > 15:
                smells.append(f"High cyclomatic: {f['name']}")

        return smells

    # ---------------- FINAL OUTPUT ---------------- #

    def _build_final_response(self):
        total_files = len(self.file_metrics)

        avg_loc = sum(f["loc"] for f in self.file_metrics) / total_files
        avg_complexity = sum(f["avg_cyclomatic"] for f in self.file_metrics) / total_files
        avg_maintainability = sum(f["maintainability"] for f in self.file_metrics) / total_files

        final_score = self._compute_final_score(avg_complexity, avg_maintainability, avg_loc)

        heatmap = [
            {
                "file": f["file"],
                "score": min(100, int(f["avg_cyclomatic"] * 6 + f["loc"] / 50)),
                "risk": "High" if f["avg_cyclomatic"] > 15 else "Moderate" if f["avg_cyclomatic"] > 8 else "Low"
            }
            for f in self.file_metrics
        ]

        top_functions = sorted(self.functions, key=lambda x: x["complexity"], reverse=True)[:10]

        confidence = int((self.parsed_files / max(1, self.total_files)) * 100)

        return {
            "final_score": final_score,
            "grade": self._grade(final_score),
            "risk_level": self._risk_level(final_score),
            "confidence": confidence,
            "summary": "Complexity derived from AST-based cyclomatic, maintainability, and LOC.",
            "heatmap": heatmap,
            "top_functions": top_functions,
            "code_smells": list(set(sum([f["code_smells"] for f in self.file_metrics], []))),
            "metrics": {
                "avg_loc": int(avg_loc),
                "avg_cyclomatic": round(avg_complexity, 2),
                "maintainability": int(avg_maintainability)
            }
        }

    def _compute_final_score(self, complexity, maintainability, loc):
        score = (
            min(100, complexity * 5) * 0.4 +
            (100 - maintainability) * 0.4 +
            min(100, loc / 10) * 0.2
        )
        return int(max(0, min(100, score)))

    def _grade(self, score):
        if score < 20: return "A"
        if score < 40: return "B"
        if score < 60: return "C"
        if score < 80: return "D"
        return "F"

    def _risk_level(self, score):
        if score < 30: return "Low"
        if score < 60: return "Moderate"
        return "High"

    def _empty_response(self):
        return {
            "final_score": 0,
            "grade": "N/A",
            "risk_level": "Unknown",
            "confidence": 0,
            "heatmap": [],
            "top_functions": [],
            "code_smells": [],
            "metrics": {}
        }


def run_complexity_analysis(repo_path: str):
    analyzer = ProductionComplexityAnalyzer(repo_path)
    return analyzer.analyze()