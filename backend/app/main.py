from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from app.db.database import engine, Base, get_db
from app.api.routes import auth_router, conversations_router, messages_router
from app.websocket.websocket_handler import websocket_endpoint
from app.models import User, Conversation, ConversationParticipant, Message
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    print("Starting up - creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")
    yield
    # Cleanup on shutdown
    print("Shutting down...")
    try:
        await engine.dispose()
        print("Database engine disposed.")
    except Exception as e:
        print(f"Error during shutdown: {e}")

app = FastAPI(title="Real-Time Chat API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"  # Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Content-Type",
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ]
)

# Include API routes
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(messages_router)

# WebSocket endpoint
@app.websocket("/ws/{conversation_id}")
async def websocket_route(
    websocket: WebSocket,
    conversation_id: int,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    await websocket_endpoint(websocket, conversation_id, token, db)


@app.get("/")
async def root():
    return {"message": "Real-Time Chat API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
