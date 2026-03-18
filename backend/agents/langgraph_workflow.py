from typing import List, Dict, TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from backend.app.config import settings

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    repo_url: str
    repo_id: str
    retrieved_chunks: List[str]
    intent: str
    response: str
    analysis_type: str # 'chat', 'tech_summary', 'non_tech_summary', 'architecture', 'system_design', 'security_scan'

def create_workflow():
    from backend.agents.nodes import (
        intent_detection_node,
        retrieval_node,
        chat_node,
        tech_summary_node,
        non_tech_summary_node,
        architecture_node,
        system_design_node,
        security_scan_node
    )

    workflow = StateGraph(AgentState)

    workflow.add_node("detect_intent", intent_detection_node)
    workflow.add_node("retrieve", retrieval_node)
    workflow.add_node("chat", chat_node)
    workflow.add_node("tech_summary", tech_summary_node)
    workflow.add_node("non_tech_summary", non_tech_summary_node)
    workflow.add_node("architecture", architecture_node)
    workflow.add_node("system_design", system_design_node)
    workflow.add_node("security_scan", security_scan_node)

    workflow.set_entry_point("detect_intent")

    def router(state: AgentState):
        if state["analysis_type"] == "chat":
            return "retrieve"
        return state["analysis_type"]

    workflow.add_conditional_edges(
        "detect_intent",
        router,
        {
            "retrieve": "retrieve",
            "tech_summary": "tech_summary",
            "non_tech_summary": "non_tech_summary",
            "architecture": "architecture",
            "system_design": "system_design",
            "security_scan": "security_scan"
        }
    )

    workflow.add_edge("retrieve", "chat")
    workflow.add_edge("chat", END)
    workflow.add_edge("tech_summary", END)
    workflow.add_edge("non_tech_summary", END)
    workflow.add_edge("architecture", END)
    workflow.add_edge("system_design", END)
    workflow.add_edge("security_scan", END)

    return workflow.compile()
