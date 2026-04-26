from langchain_groq import ChatGroq
from backend.app.config import settings
from backend.embeddings.vector_store import vector_store
from langchain_core.messages import AIMessage
import json

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.LLM_MODEL_NAME, streaming=True)

async def intent_detection_node(state):
    last_message = state["messages"][-1].content
    
    # If the user is already in a specific analysis flow (summary, architecture, etc.), keep it.
    # However, if it's 'chat', we'll re-evaluate if they are asking for a summary explicitly.
    if state.get("analysis_type") and state["analysis_type"] not in ["chat", None]:
        return {"intent": state["analysis_type"]}
    
    prompt = f"""
    Analyze the user message and determine the primary intent.
    Possible intents:
    - tech_summary: Explicit request for a full technical breakdown, developer overview, or "how it works" for the WHOLE repo.
    - non_tech_summary: Explicit request for a business overview, product features, or "what is this for" for the WHOLE repo.
    - architecture: Explicit request for directory structure, module layout, or system architecture for the WHOLE repo.
    - system_design: Explicit request for design patterns, infrastructure, or high-level diagrams for the WHOLE repo.
    - security_scan: Explicit request to check for vulnerabilities, secrets, or security issues.
    - code_analysis: Explicit request to check code quality, smells, duplicates, or bad practices.
    - complexity_analysis: Explicit request to check repository complexity, heatmap, and scoring.
    - chat: General questions, specific code lookups, or anything else that is NOT a request for a full repository summary.
    
    User Message: "{last_message}"
    
    Return ONLY one of the intent strings. Default to 'chat' if it's a specific question or concept inquiry.
    """
    response = await llm.ainvoke(prompt)
    intent = response.content.strip().lower()
    
    valid_intents = ["chat", "tech_summary", "non_tech_summary", "architecture", "system_design", "security_scan", "code_analysis", "complexity_analysis"]
    # Cleanup for cases where LLM returns more than just the word
    for v in valid_intents:
        if v in intent:
            intent = v
            break
    else:
        intent = "chat"
        
    return {"intent": intent, "analysis_type": intent}

async def retrieval_node(state):
    last_message = state["messages"][-1].content
    repo_id = state["repo_id"]
    
    results = vector_store.query(repo_id, last_message)
    chunks = results['documents'][0]
    
    return {"retrieved_chunks": chunks}

async def chat_node(state):
    last_message = state["messages"][-1].content
    context = "\n---\n".join(state["retrieved_chunks"])
    
    prompt = f"""
    You are RepoMind AI, an expert software architect with deep knowledge of the provided codebase.
    
    Your goal is to provide a hybrid response that combines your general programming knowledge with specific details from the repository.
    
    STRICT RULES:
    1. If the question is about a specific implementation in this repo, use the provided context.
    2. If the user asks about a general programming concept (e.g., "What is a decorator?", "How does React work?"):
        - Explain the concept accurately using your own internal knowledge.
        - SEARCH the provided context to see if this concept is used in the repository.
        - If found, provide examples/references to files in this repo where the concept is used.
        - If NOT found, explicitly state: "This concept does not appear to be used in the current repository."
    3. When referring to files, always use the relative paths provided in the context.
    4. If you are unsure and the context doesn't help, be honest and state what you know and what is missing from the repo.
    
    Context from Repository:
    {context}
    
    Question: {last_message}
    
    Answer concisely, technically, and helpfully.
    """
    response = await llm.ainvoke(prompt)
    return {"messages": [AIMessage(content=response.content)], "response": response.content}

async def tech_summary_node(state):
    repo_id = state["repo_id"]
    results = vector_store.query(repo_id, "high level technical overview, tech stack, main components", n_results=15)
    context = "\n---\n".join(results['documents'][0])
    
    prompt = f"""
    Synthesize a professional technical summary for this codebase.
    Identify the core tech stack, main services, and key implementation patterns.
    Do not just list the files; provide a narrative of how the system is built.
    
    Context Extracts:
    {context}
    """
    response = await llm.ainvoke(prompt)
    return {"response": response.content}

async def non_tech_summary_node(state):
    repo_id = state["repo_id"]
    results = vector_store.query(repo_id, "business logic and product features", n_results=10)
    context = "\n---\n".join(results['documents'][0])
    
    prompt = f"""
    You are a high-level business consultant and technical strategist. 
    Your goal is to "sell" this project to a non-technical audience (executives, stakeholders, or potential investors).
    
    Based on the following code context, provide an Executive Summary that:
    1. Explains the "Value Proposition": What problem does this solve and why is it valuable?
    2. High-level Features: What are the key business-facing capabilities?
    3. Market Suitability: Who is the target user for this software?
    4. Future Potential: What could this grow into?
    
    STRICT RULES:
    - NO technical jargon (e.g., "REST API", "React Hook", "Async/Await").
    - Focus on outcomes and impact, not implementation.
    - Use a professional, persuasive, and visionary tone.
    - Format with clear, high-level sections.
    
    Context Extracts:
    {context}
    """
    response = await llm.ainvoke(prompt)
    return {"response": response.content}

async def architecture_node(state):
    repo_id = state["repo_id"]
    results = vector_store.query(repo_id, "project structure, modules, and data flow", n_results=10)
    context = "\n---\n".join(results['documents'][0])
    
    prompt = f"Explain the technical architecture and directory structure of this repository:\n\n{context}"
    response = await llm.ainvoke(prompt)
    return {"response": response.content}

async def system_design_node(state):
    repo_id = state["repo_id"]
    results = vector_store.query(repo_id, "infrastructure, database schema, and high level design", n_results=10)
    context = "\n---\n".join(results['documents'][0])
    
    prompt = f"Generate a detailed system design explanation for this project based on the code:\n\n{context}"
    response = await llm.ainvoke(prompt)
    return {"response": response.content}
async def security_scan_node(state):
    import os
    from backend.tools.security_scanner import run_security_scan
    from backend.app.config import settings
    
    repo_id = state["repo_id"]
    repo_path = os.path.join(settings.REPO_STORAGE_DIR, repo_id)
    
    if not os.path.exists(repo_path):
        return {"response": f"Error: Repository path not found at {repo_path}."}
        
    scan_results = run_security_scan(repo_path)
    
    prompt = f"""
    You are a security expert. Analyze the following security scan results and provide a professional, actionable summary.
    
    STRICT FORMATTING RULES:
    1. Use a Markdown Table for "Vulnerabilities Identified" with columns: | File | Line | Type | Severity | Description | Recommendation |.
    2. Use fenced code blocks (```language) for any specific code snippets or secrets found.
    3. Ensure no unnecessary escaping (like \") appears in the output.
    4. Highlight the most critical (High/Critical) findings first.
    
    Scan Results:
    {json.dumps(scan_results, indent=2)}
    
    Format the response in a professional security report style.
    """
    response = await llm.ainvoke(prompt)
    return {"response": response.content}

async def code_analysis_node(state):
    import os
    from backend.tools.code_analyzer import run_code_analysis
    from backend.app.config import settings
    
    repo_id = state["repo_id"]
    repo_path = os.path.join(settings.REPO_STORAGE_DIR, repo_id)
    
    if not os.path.exists(repo_path):
        return {"response": f"Error: Repository path not found at {repo_path}."}
        
    analysis_results = run_code_analysis(repo_path)
    
    prompt = f"""
    You are a code quality expert. Analyze the following results and provide a professional, constructive report.
    
    STRICT FORMATTING RULES:
    1. Use Markdown Tables for identifying specific issues:
       - | File | Line | Type | Description | for "Code Smells" and "Bad Practices".
       - | File A | Line | File B | Line | Content Snippet | for "Duplicate Code".
    2. Use fenced code blocks (```language) for any code snippets or refactoring examples.
    3. Ensure no unnecessary escaping (like \") appears in the output.
    
    Scan Results:
    {json.dumps(analysis_results, indent=2)}
    
    Include sections for:
    - Summary of Findings
    - Unused Imports
    - Code Smells (Long Functions, Excessive Arguments) - USE TABLES
    - Duplicate Code - USE TABLES
    - Bad Practices - USE TABLES
    - Recommendations (with code examples)
    """
    response = await llm.ainvoke(prompt)
    return {"response": response.content}

async def complexity_analysis_node(state):
    import os
    from backend.tools.complexity_analyzer import run_complexity_analysis
    from backend.app.config import settings
    
    repo_id = state["repo_id"]
    repo_path = os.path.join(settings.REPO_STORAGE_DIR, repo_id)
    
    if not os.path.exists(repo_path):
        return {"response": f"Error: Repository path not found at {repo_path}."}
        
    analysis_results = run_complexity_analysis(repo_path)
    
    prompt = f"""
    You are a senior software architect and complexity expert.
    Analyze the following complexity scan results and provide a comprehensive report.
    
    STRICT FORMATTING RULES:
    1. Show "Technical Health: {analysis_results['final_score']}/100 ({analysis_results['grade']})" as a large heading.
    2. Use a Markdown Table for the "File Heatmap Summary" using: | File | Risk | Score | Reason |.
    3. Use a Markdown Table for "Top 10 Complex Functions" using: | Function | File | Complexity | Drivers |.
    4. Ensure no unnecessary escaping (like \") appears in the output.
    
    Analysis Results:
    {json.dumps(analysis_results, indent=2)}
    
    Format the response:
    1. Start with the Health Score and Grade.
    2. Provide a "Core Metrics (Health %)" section.
    3. Include the "Risk Heatmap" and "Complex Functions" tables.
    4. Conclude with "Anti-patterns & Recommendations" based on detected smells.
    """
    response = await llm.ainvoke(prompt)
    return {"response": response.content}
