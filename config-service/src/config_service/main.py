from contextlib import asynccontextmanager
from fastapi import FastAPI

from .api.routers import router as api_router
from .db import close_db, init_db
from .migrations import run_migrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    await run_migrations()
    yield
    # Shutdown
    close_db()

app = FastAPI(
    title="Config Service",
    description="A simple REST API for managing application configurations",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
