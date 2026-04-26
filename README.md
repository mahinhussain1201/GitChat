---
title: RepoMind
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

<div align="center">

# RepoMind

**AI-powered code intelligence. Understand any repository instantly.**

[Features](#features) · [Architecture](#architecture) · [Tech Stack](#tech-stack) · [Quick Start](#quick-start) · [API Reference](#api-reference)

---

</div>

RepoMind is a full-stack AI assistant that lets you drop in any public GitHub URL and immediately receive deep, structured insights — architecture reviews, security audits, complexity heatmaps, and a conversational Q&A interface — all powered by a **LangGraph multi-agent workflow** backed by Llama 3.1 via Groq.

---

## Features

| Capability | Description |
|---|---|
| **Conversational Code Q&A** | Stream-chat with the entire codebase through a context-aware RAG pipeline |
| **Technical Summary** | Developer-focused narrative of the tech stack, main modules, and patterns |
| **Executive Summary** | Business-value overview written for non-technical stakeholders |
| **Architecture Review** | Module layout, service boundaries, and data-flow analysis |
| **Security Scan** | Static-analysis scan for hardcoded secrets, dangerous patterns, and vulnerabilities |
| **Code Quality Analysis** | Detects long functions, deep nesting, code smells, and duplicate logic |
| **Complexity Report** | Per-file heatmap with cyclomatic complexity, maintainability index, and a 0–100 health score |
| **Multi-Language Support** | AST-based analysis for Python; heuristic analysis for JS/TS, Java, Go, C++, Kotlin, Rust, and more |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      React Frontend                       │
│  Landing → UrlForm → Dashboard → ChatInput / EmptyState  │
│           Modular Components · Responsive Layout          │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP / SSE Streaming
┌────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                         │
│   /analyze-repo  /chat-stream  /security-scan  …         │
└────┬─────────────────────────────────────────┬───────────┘
     │                                         │
┌────▼──────────────────┐          ┌──────────▼──────────────┐
│   LangGraph Workflow   │          │    Static Analysis Tools │
│  ┌─────────────────┐  │          │  complexity_analyzer.py  │
│  │  Intent Router  │  │          │  security_scanner.py     │
│  └───────┬─────────┘  │          │  code_analyzer.py        │
│          │ routes to  │          └─────────────────────────┘
│  ┌───────▼──────────┐ │
│  │  Specialist Node │ │          ┌─────────────────────────┐
│  │  (one of 8 types)│ │          │    ChromaDB + MiniLM     │
│  └───────┬──────────┘ │          │  Vector Store · RAG      │
│          │            │          └─────────────────────────┘
│  ┌───────▼──────────┐ │
│  │  Groq Llama 3.1  │ │
│  │  Streaming LLM   │ │
│  └──────────────────┘ │
└───────────────────────┘
```

### How It Works

1. **Ingestion** — The repository is cloned locally using GitPython. Source files are chunked using `langchain-text-splitters` (800-token chunks with overlap).
2. **Embedding** — Chunks are embedded using `all-MiniLM-L6-v2` (Sentence Transformers) and stored in a local **ChromaDB** vector store, keyed by repository URL.
3. **Intent Detection** — Every user message passes through an LLM-based intent classifier in the LangGraph workflow. It routes to one of 8 specialised agent nodes: `tech_summary`, `architecture`, `security_scan`, `code_analysis`, `complexity_analysis`, or `chat`.
4. **RAG Chat** — For free-form questions, the retrieval node fetches the top semantically-relevant chunks and passes them as context to the LLM.
5. **Static Analysis** — Security scans and complexity reports run deterministic, in-process Python tools on the cloned repository — no LLM required for raw data collection.
6. **Streaming** — Chat responses are streamed token-by-token via `StreamingResponse` / Server-Sent Events directly to the React frontend.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn |
| Agent Orchestration | LangGraph (StateGraph) |
| LLM | Llama 3.1 8B via Groq API |
| Embeddings | `all-MiniLM-L6-v2` (Sentence Transformers) |
| Vector Store | ChromaDB (local, persistent) |
| Repo Cloning | GitPython |
| Chunking | LangChain Text Splitters |
| Config | Pydantic + python-dotenv |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| HTTP Client | Axios |
| Markdown | react-markdown + remark-gfm |
| Styling | Vanilla CSS (custom design token system) |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/mahinhussain1201/GitChat.git
cd GitChat
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
LANGCHAIN_API_KEY=your_langchain_key_here   # optional – for LangSmith tracing
LANGCHAIN_TRACING_V2=false
```

### 3. Set up the backend

```bash
# Create and activate a virtual environment
python -m venv env
source env/bin/activate        # Windows: env\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Start the API server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at `http://localhost:8000`.

### 4. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in your terminal) in your browser.

### 5. Analyze a repository

Paste any public GitHub URL into the input field and click **Analyze**. The system will:
- Clone the repository
- Index the codebase into the vector store
- Calculate the complexity health score
- Open the interactive dashboard

---

## API Reference

All endpoints accept and return `application/json`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze-repo` | Clone, embed, and analyze a repository |
| `POST` | `/chat` | Single-turn Q&A (non-streaming) |
| `POST` | `/chat-stream` | Streaming Q&A via SSE |
| `POST` | `/tech-summary` | Generate a technical summary |
| `POST` | `/non-tech-summary` | Generate an executive/business summary |
| `POST` | `/architecture` | Produce an architecture breakdown |
| `POST` | `/system-design` | Generate a system design overview |
| `POST` | `/security-scan` | Run static security analysis |
| `POST` | `/code-analysis` | Run code quality analysis |
| `POST` | `/complexity-analysis` | Generate the in-depth complexity report |

**Request body (all endpoints):**
```json
{ "repo_url": "https://github.com/owner/repository" }
```

**Chat endpoints additionally require:**
```json
{ "repo_url": "https://github.com/owner/repository", "message": "your question" }
```

---

## Health Score Explained

The repository health score (0–100) is computed from three weighted components:

| Component | Weight | Metric |
|---|---|---|
| Cyclomatic Complexity | 40% | Average control-flow branches per function |
| Maintainability Index | 40% | Halstead volume + complexity + LOC formula |
| Code Density | 20% | Average lines of code per file |

```
health_score = 100 − (complexity × 0.4 + (100 − maintainability) × 0.4 + density × 0.2)
```

| Grade | Score | Meaning |
|---|---|---|
| A | 80–100 | Excellent — minimal complexity |
| B | 60–79  | Good — minor issues |
| C | 40–59  | Fair — needs attention |
| D | 20–39  | Poor — high complexity |
| F | 0–19   | Critical — significant refactoring needed |

---

## Project Structure

```
GitChat/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, CORS
│   │   └── config.py        # Environment config (Pydantic)
│   ├── agents/
│   │   ├── langgraph_workflow.py   # StateGraph definition & router
│   │   └── nodes.py               # 8 specialist agent nodes
│   ├── services/
│   │   ├── repo_service.py         # Clone + embed pipeline
│   │   └── chat_service.py         # Workflow invocation & streaming
│   ├── embeddings/
│   │   └── vector_store.py         # ChromaDB wrapper
│   ├── ingestion/
│   │   └── clone_repo.py           # GitPython clone logic
│   └── tools/
│       ├── complexity_analyzer.py  # AST + heuristic complexity engine
│       ├── security_scanner.py     # Static security scan
│       └── code_analyzer.py        # Code quality analysis
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── chat/        # ChatMessage · ChatInput · EmptyState
│       │   ├── health/      # HealthRing · MetricBar · HealthBreakup
│       │   ├── landing/     # UrlForm · LoadingState · StatCards
│       │   ├── layout/      # Sidebar · MobileHeader
│       │   └── icons.tsx    # SVG icon library
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   └── LandingPage.tsx
│       └── services/
│           └── api.ts       # Axios service layer
│
├── .env                     # API keys (not committed)
└── README.md
```

---

## Limitations

- Only **public** GitHub repositories are supported.
- Large repositories (>500 files) may take 30–60 seconds to fully index on first load.
- Non-Python language analysis uses regex heuristics rather than full AST parsing.
- The vector store persists locally in `chroma_db/` — clearing this directory forces re-indexing.

---

## Future Improvements

- [ ] Support for private repositories via GitHub OAuth
- [ ] Full AST-based analysis for JavaScript and TypeScript using tree-sitter
- [ ] Persistent chat history with conversation memory
- [ ] Side-by-side file viewer with complexity annotations
- [ ] Docker Compose setup for one-command deployment

---

<div align="center">

Built with FastAPI · LangGraph · ChromaDB · Llama 3.1 · React

</div>
