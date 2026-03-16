from langchain_groq import ChatGroq
from backend.app.config import settings
from backend.embeddings.vector_store import vector_store
from langchain_core.messages import HumanMessage, AIMessage
import json

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name=settings.LLM_MODEL_NAME)

async def intent_detection_node(state):
    last_message = state["messages"][-1].content
    
    # Simple logic to override intent if analysis_type is pre-set
    if state.get("analysis_type") and state["analysis_type"] != "chat":
        return {"intent": state["analysis_type"]}
    
    prompt = f"""
    Analyze the user message and determine the intent.
    Possible intents: chat, tech_summary, non_tech_summary, architecture, system_design.
    
    User Message: {last_message}
    
    Return only the intent string.
    """
    response = await llm.ainvoke(prompt)
    intent = response.content.strip().lower()
    
    valid_intents = ["chat", "tech_summary", "non_tech_summary", "architecture", "system_design"]
    if intent not in valid_intents:
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
    You are an expert AI software architect. Answer questions about the provided codebase context.
    
    Context:
    {context}
    
    Question: {last_message}
    """
    response = await llm.ainvoke(prompt)
    return {"messages": [AIMessage(content=response.content)], "response": response.content}

async def tech_summary_node(state):
    repo_id = state["repo_id"]
    results = vector_store.query(repo_id, "high level technical overview of all files", n_results=10)
    context = "\n---\n".join(results['documents'][0])
    
    prompt = f"Provide a deep technical summary of the following codebase extracts:\n\n{context}"
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
