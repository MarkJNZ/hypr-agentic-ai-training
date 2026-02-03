import logging
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

from .config import settings

logger = logging.getLogger(__name__)

# Connection pool setup
# We use a ThreadedConnectionPool because we'll be accessing it from multiple threads
# via the ThreadPoolExecutor to keep the FastAPI event loop unblocked.
_pool: ThreadedConnectionPool | None = None

# Thread pool for running synchronous psycopg2 calls
_executor = ThreadPoolExecutor(max_workers=10)

def init_db():
    global _pool
    if _pool is None:
        try:
            _pool = ThreadedConnectionPool(
                minconn=1,
                maxconn=20,
                dsn=settings.db_url,
                cursor_factory=RealDictCursor
            )
            logger.info("Database connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            raise

def close_db():
    global _pool
    if _pool is not None:
        _pool.closeall()
        _pool = None
        logger.info("Database connection pool closed")

@asynccontextmanager
async def get_db_cursor() -> AsyncGenerator[RealDictCursor, None]:
    """
    Async context manager to get a database cursor.
    Uses a thread pool to perform synchronous psycopg2 operations.
    """
    if _pool is None:
        init_db()
        
    conn = _pool.getconn()
    try:
        # We perform the cursor acquisition and yield in the current thread,
        # but actual execution should be wrapped in more helpers or handled in the caller
        # using the executor if they want to be fully non-blocking.
        with conn.cursor() as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)

async def execute_query(query: str, params: tuple | None = None):
    """Executes a query in the thread pool."""
    import asyncio
    loop = asyncio.get_running_loop()
    
    def _execute():
        if _pool is None:
            init_db()
        conn = _pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if cur.description:
                    return cur.fetchall()
                conn.commit()
                return None
        except Exception:
            conn.rollback()
            raise
        finally:
            _pool.putconn(conn)
            
    return await loop.run_in_executor(_executor, _execute)
