import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.init_db import init_db
from app.services.websocket_manager import ws_manager

# Import API Routers
from app.api.v1 import (
    auth, schools, courses, branches, counselors, requests,
    telephony, working_hours, knowledge, faqs, workflows, calls,
    notifications, analytics, settings as settings_api, simulator, health
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("svkm_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SVKM Global University Dhule Database and Services...")
    init_db()
    logger.info("Database initialized and ready.")
    yield
    logger.info("Shutting down SVKM Voice Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Complete AI-Powered Multilingual Voice Admission, Information & Intelligent Counselor Routing Platform for SVKM Global University, Dhule",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
api_v1 = "/api/v1"
app.include_router(auth.router, prefix=api_v1)
app.include_router(schools.router, prefix=api_v1)
app.include_router(courses.router, prefix=api_v1)
app.include_router(branches.router, prefix=api_v1)
app.include_router(counselors.router, prefix=api_v1)
app.include_router(requests.router, prefix=api_v1)
app.include_router(telephony.router, prefix=api_v1)
app.include_router(working_hours.router, prefix=api_v1)
app.include_router(knowledge.router, prefix=api_v1)
app.include_router(faqs.router, prefix=api_v1)
app.include_router(workflows.router, prefix=api_v1)
app.include_router(calls.router, prefix=api_v1)
app.include_router(notifications.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)
app.include_router(settings_api.router, prefix=api_v1)
app.include_router(simulator.router, prefix=api_v1)
app.include_router(health.router, prefix=api_v1)

# WebSocket Endpoints
@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await ws_manager.connect_dashboard(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Heartbeat or client ping
    except WebSocketDisconnect:
        ws_manager.disconnect_dashboard(websocket)

@app.websocket("/ws/counselor/{counselor_id}")
async def websocket_counselor(websocket: WebSocket, counselor_id: str):
    await ws_manager.connect_counselor(counselor_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_counselor(counselor_id, websocket)

@app.websocket("/ws/call/{call_id}")
async def websocket_call_audio(websocket: WebSocket, call_id: str):
    await ws_manager.connect_call(call_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_call(call_id, websocket)

@app.get("/")
def root():
    return {
        "organization": "SVKM Global University, Dhule",
        "system": "AI-Powered Multilingual Voice Admission & Counselor Routing Platform",
        "version": "2.0.0",
        "docs_url": "/docs",
        "health_url": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
