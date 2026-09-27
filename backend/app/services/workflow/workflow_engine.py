import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Workflow

logger = logging.getLogger("workflow_engine")

class WorkflowEngine:
    @staticmethod
    def get_active_workflow(db: Session) -> Optional[Workflow]:
        return db.query(Workflow).filter(Workflow.status == "PUBLISHED").first()

    @classmethod
    def execute_next_node(cls, db: Session, current_node_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate workflow graph transition based on current session context.
        """
        workflow = cls.get_active_workflow(db)
        if not workflow or not workflow.nodes_json:
            return {"next_node": "ai_conversation_default", "action": "CONTINUE"}

        try:
            nodes = json.loads(workflow.nodes_json)
            edges = json.loads(workflow.edges_json or "[]")
            
            # Find outgoing edges from current node
            matching_edge = None
            for edge in edges:
                if edge.get("source") == current_node_id:
                    # Check condition
                    condition = edge.get("data", {}).get("condition")
                    if not condition or condition == "default":
                        matching_edge = edge
                        break
                    elif condition == "counselor_requested" and context.get("counselor_requested"):
                        matching_edge = edge
                        break
                    elif condition == "closed" and not context.get("is_open"):
                        matching_edge = edge
                        break

            if matching_edge:
                target_id = matching_edge.get("target")
                target_node = next((n for n in nodes if n["id"] == target_id), None)
                return {
                    "next_node": target_id,
                    "node_data": target_node,
                    "action": target_node.get("type", "MESSAGE") if target_node else "CONTINUE"
                }
        except Exception as e:
            logger.error(f"Error executing workflow graph: {e}")

        return {"next_node": "default_end", "action": "CONTINUE"}

workflow_engine = WorkflowEngine()
