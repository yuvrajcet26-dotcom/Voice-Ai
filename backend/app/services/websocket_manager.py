import json
import logging
from typing import Dict, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")

class WebSocketManager:
    def __init__(self):
        # Set of active dashboard connections
        self.dashboard_connections: Set[WebSocket] = set()
        # Map of counselor_id -> set of active WebSockets
        self.counselor_connections: Dict[str, Set[WebSocket]] = {}
        # Map of call_id -> set of active WebSockets
        self.call_connections: Dict[str, Set[WebSocket]] = {}

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_connections.add(websocket)
        logger.info(f"Dashboard connected. Total dashboards: {len(self.dashboard_connections)}")

    def disconnect_dashboard(self, websocket: WebSocket):
        self.dashboard_connections.discard(websocket)
        logger.info(f"Dashboard disconnected. Remaining: {len(self.dashboard_connections)}")

    async def connect_counselor(self, counselor_id: str, websocket: WebSocket):
        await websocket.accept()
        if counselor_id not in self.counselor_connections:
            self.counselor_connections[counselor_id] = set()
        self.counselor_connections[counselor_id].add(websocket)
        logger.info(f"Counselor {counselor_id} connected. Active sockets: {len(self.counselor_connections[counselor_id])}")

    def disconnect_counselor(self, counselor_id: str, websocket: WebSocket):
        if counselor_id in self.counselor_connections:
            self.counselor_connections[counselor_id].discard(websocket)
            if not self.counselor_connections[counselor_id]:
                del self.counselor_connections[counselor_id]
        logger.info(f"Counselor {counselor_id} disconnected.")

    async def connect_call(self, call_id: str, websocket: WebSocket):
        await websocket.accept()
        if call_id not in self.call_connections:
            self.call_connections[call_id] = set()
        self.call_connections[call_id].add(websocket)
        logger.info(f"Call {call_id} stream connected.")

    def disconnect_call(self, call_id: str, websocket: WebSocket):
        if call_id in self.call_connections:
            self.call_connections[call_id].discard(websocket)
            if not self.call_connections[call_id]:
                del self.call_connections[call_id]
        logger.info(f"Call {call_id} stream disconnected.")

    async def broadcast_to_dashboards(self, event_type: str, data: Any):
        payload = json.dumps({"event": event_type, "data": data})
        dead = []
        for ws in list(self.dashboard_connections):
            try:
                await ws.send_text(payload)
            except Exception as e:
                logger.error(f"Error sending to dashboard ws: {e}")
                dead.append(ws)
        for d in dead:
            self.dashboard_connections.discard(d)

    async def send_to_counselor(self, counselor_id: str, event_type: str, data: Any):
        payload = json.dumps({"event": event_type, "data": data})
        if counselor_id in self.counselor_connections:
            dead = []
            for ws in list(self.counselor_connections[counselor_id]):
                try:
                    await ws.send_text(payload)
                except Exception as e:
                    logger.error(f"Error sending to counselor {counselor_id} ws: {e}")
                    dead.append(ws)
            for d in dead:
                self.counselor_connections[counselor_id].discard(d)

    async def send_to_call(self, call_id: str, event_type: str, data: Any):
        payload = json.dumps({"event": event_type, "data": data})
        if call_id in self.call_connections:
            dead = []
            for ws in list(self.call_connections[call_id]):
                try:
                    await ws.send_text(payload)
                except Exception as e:
                    logger.error(f"Error sending to call {call_id} ws: {e}")
                    dead.append(ws)
            for d in dead:
                self.call_connections[call_id].discard(d)

ws_manager = WebSocketManager()
