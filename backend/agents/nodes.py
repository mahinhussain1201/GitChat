from langchain_groq import ChatGroq
from backend.app.config import settings
from backend.embeddings.vector_store import vector_store
from langchain_core.messages import HumanMessage, AIMessage
import json

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.LLM_MODEL_NAME)

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
    - chat: General questions, specific code lookups, or anything else that is NOT a request for a full repository summary.
    
    User Message: "{last_message}"
    
    Return ONLY one of the intent strings. Default to 'chat' if it's a specific question or concept inquiry.
    """
    response = await llm.ainvoke(prompt)
    intent = response.content.strip().lower()
    
    valid_intents = ["chat", "tech_summary", "non_tech_summary", "architecture", "system_design"]
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
    
    prompt = f"Provide a non-technical, business-level summary of what this project does:\n\n{context}"
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
