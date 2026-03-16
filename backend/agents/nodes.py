from langchain_groq import ChatGroq
from backend.app.config import settings
from backend.embeddings.vector_store import vector_store
from langchain_core.messages import HumanMessage, AIMessage
import json

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.LLM_MODEL_NAME)

async def intent_detection_node(state):
    last_message = state["messages"][-1].content
    
    if state.get("analysis_type") and state["analysis_type"] != "chat":
        return {"intent": state["analysis_type"]}
    
    prompt = f"""
    Analyze the user message and determine the primary intent.
    Possible intents:
    - tech_summary: Request for a deep technical breakdown, developer overview, or "how it works".
    - non_tech_summary: Request for a business overview, product features, or "what is this for".
    - architecture: Request for directory structure, module layout, or system architecture.
    - system_design: Request for design patterns, infrastructure, or high-level diagrams.
    - chat: General questions, specific code lookups, or anything else.
    
    User Message: "{last_message}"
    
    Return ONLY one of the intent strings.
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
    
    STRICT RULES:
    1. Base your answer ONLY on the provided codebase context.
    2. If the context does not contain the answer, say "I don't have enough information in the provided context to answer that precisely."
    3. Do NOT provide general programming definitions unless they are directly relevant to explaining the specific implementation in this code.
    4. When referring to files, use the relative paths provided in the context.
    
    Context:
    {context}
    
    Question: {last_message}
    
    Answer concisely and technically.
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
