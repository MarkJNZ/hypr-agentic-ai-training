from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routers import router as api_router, auth_router
from .config import settings
from .db import close_db, init_db
from .migrations import run_migrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    # await run_migrations()
    yield
    # Shutdown
    close_db()

app = FastAPI(
    title="Config Service",
    description="A simple REST API for managing application configurations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow the UI origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ui_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes at /auth (not under /api/v1)
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# API routes under /api/v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
