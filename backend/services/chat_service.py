from backend.agents.langgraph_workflow import create_workflow
from backend.ingestion.clone_repo import get_repo_id
from langchain_core.messages import HumanMessage

class ChatService:
    def __init__(self):
        self.workflow = create_workflow()
        
    async def chat(self, repo_url: str, message: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content=message)],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "chat"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]

    async def stream_chat(self, repo_url: str, message: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content=message)],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "chat"
        }
        
        async for event in self.workflow.astream_events(state, version="v2"):
            kind = event["event"]
            node = event.get("metadata", {}).get("langgraph_node", "")
            
            allowed_nodes = [
                "chat", "tech_summary", "non_tech_summary", 
                "architecture", "system_design", "security_scan", 
                "code_analysis", "complexity_analysis"
            ]
            
            if kind == "on_chat_model_stream" and node in allowed_nodes:
                content = event["data"]["chunk"].content
                if content:
                    yield content
    
    async def get_summary(self, repo_url: str, type: str = "technical"):
        repo_id = get_repo_id(repo_url)
        analysis_type = "tech_summary" if type == "technical" else "non_tech_summary"
        
        state = {
            "messages": [HumanMessage(content=f"Generate {type} summary")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": analysis_type
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]
        
    async def get_architecture(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content="Explain architecture")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "architecture"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]
        
    async def get_system_design(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content="Generate system design")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "system_design"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]

    async def get_security_scan(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content="Run security scan")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "security_scan"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]

    async def get_code_analysis(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content="Run code quality analysis")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "code_analysis"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]

    async def get_complexity_analysis(self, repo_url: str):
        repo_id = get_repo_id(repo_url)
        state = {
            "messages": [HumanMessage(content="Run complexity analysis")],
            "repo_url": repo_url,
            "repo_id": repo_id,
            "analysis_type": "complexity_analysis"
        }
        result = await self.workflow.ainvoke(state)
        return result["response"]
