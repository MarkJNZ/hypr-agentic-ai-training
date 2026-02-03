import logging
import os
from pathlib import Path

from .db import execute_query, init_db

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).parent.parent.parent / "migrations"

async def ensure_migrations_table():
    """Creates the migrations table if it doesn't exist."""
    query = """
    CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    await execute_query(query)

async def run_migrations():
    """Runs all pending migrations."""
    await ensure_migrations_table()
    
    # Get applied migrations
    applied = await execute_query("SELECT name FROM migrations")
    applied_names = {row["name"] for row in applied}
    
    # Get migration files
    if not MIGRATIONS_DIR.exists():
        os.makedirs(MIGRATIONS_DIR)
        
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    
    for file in migration_files:
        if file.name not in applied_names:
            logger.info(f"Applying migration: {file.name}")
            with open(file, "r") as f:
                sql = f.read()
            
            # Execute migration and record it
            # In a real system, we should use a transaction that covers both
            try:
                # We use execute_query which handles its own commits/rollbacks per call
                # For migrations it might be better to have a dedicated transaction helper
                await execute_query(sql)
                await execute_query(
                    "INSERT INTO migrations (name) VALUES (%s)", 
                    (file.name,)
                )
                logger.info(f"Successfully applied: {file.name}")
            except Exception as e:
                logger.error(f"Failed to apply migration {file.name}: {e}")
                raise

if __name__ == "__main__":
    import asyncio
    init_db()
    asyncio.run(run_migrations())
