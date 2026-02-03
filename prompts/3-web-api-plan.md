# Config Service Implementation Plan

This document outlines the implementation plan for the Config Service, a REST Web API built with Python and FastAPI, strictly adhering to the provided specifications.

## Project Structure

```text
config-service/
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── Makefile             # Task automation
├── pyproject.toml       # Project metadata and dependencies (managed by uv)
├── uv.lock              # Dependency lock file (managed by uv)
├── src/
│   └── config_service/
│       ├── __init__.py
│       ├── main.py      # Application entry point
│       ├── config.py    # Service configuration (pydantic-settings)
│       ├── config_test.py
│       ├── db.py        # Database connection pool and execution helpers
│       ├── db_test.py
│       ├── migrations.py # Migration system implementation
│       ├── migrations_test.py
│       ├── models.py    # Pydantic data models
│       ├── models_test.py
│       └── api/
│           ├── __init__.py
│           ├── routers.py # API route definitions
│           └── routers_test.py
├── migrations/          # SQL migration files
│   ├── 001_initial_schema.sql
│   └── ...
└── tests/               # Integration tests and helpers (only if needed)
    └── conftest.py      # Shared test fixtures (e.g., db setup)
```

## Dependencies

We will use `uv` to manage dependencies.

**Runtime Dependencies:**

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `fastapi` | `0.116.1` | Web framework |
| `pydantic` | `2.11.7` | Data validation |
| `pydantic-settings` | `>=2.0.0,<3.0.0` | Service configuration |
| `psycopg2` | `2.9.10` | PostgreSQL adapter |
| `python-ulid` | `>=2.0.0,<3.0.0` | ULID generation (wrapped by Pydantic) |

**Development Dependencies:**

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `pytest` | `8.4.1` | Testing framework |
| `httpx` | `0.28.1` | HTTP client for testing |

## Architectural Patterns & Design Decisions

### 1. Database Interaction (No ORM)
- **Direct SQL**: We will write raw SQL queries for all database operations.
- **Connection Pooling**:
    - `psycopg2.pool.ThreadedConnectionPool` will be used to manage connections efficiently.
    - An `asynccontextmanager` in `src/config_service/db.py` will yield connections from the pool.
- **Async/Threading**:
    - Since `psycopg2` is synchronous, database operations will be offloaded to a thread pool using `concurrent.futures.ThreadPoolExecutor` to avoid blocking the FastAPI event loop.
- **Cursors**: Use `psycopg2.extras.RealDictCursor` to get dictionary-like results.

### 2. Configuration Management
- Use `pydantic-settings` to load configuration from environment variables and `.env` files.
- Configuration class will be defined in `src/config_service/config.py`.

### 3. API Design
- **Prefix**: All endpoints will be served under `/api/v1`.
- **Routing**: Routes will be defined in `src/config_service/api/routers.py`.
- **Models**: Pydantic models in `src/config_service/models.py` will define request and response schemas, distinct from strict DB schemas where possible for flexibility.
    - `id` fields will use `pydantic_extra_types.ulid.ULID`.

### 4. Migration System
- **Custom Implementation**: A lightweight migration system in `src/config_service/migrations.py`.
- **Mechanism**:
    - Check/Create a `migrations` table in the DB.
    - read `.sql` files from the `migrations/` directory.
    - Apply migrations that haven't been recorded in the `migrations` table.
    - Wrap migration application in a transaction.

### 5. Testing Strategy
- **Unit Tests**: Co-located with code (`_test.py` suffix).
    - Focus on high coverage (80%+) of core logic.
    - `db_test.py` will test the pool and query execution logic (likely needing a real DB or careful mocking).
    - `migrations_test.py` will verify the migration logic.
- **Integration Tests**: Placed in `tests/` if they span multiple components or require a full running app instance (using `TestClient`).

## Detailed Implementation Steps

1.  **Project Initialization**:
    - Initialize git repository.
    - Run `uv init`.
    - `uv add "fastapi==0.116.1" "pydantic==2.11.7" "pydantic-settings>=2.0.0,<3.0.0" "psycopg2==2.9.10" "python-ulid>=2.0.0,<3.0.0"`
    - `uv add --dev "pytest==8.4.1" "httpx==0.28.1"`

2.  **Database Layer Setup**:
    - Implement `db.py` with `ThreadedConnectionPool` and `ThreadPoolExecutor`.
    - Create the dependency for getting a DB cursor.

3.  **Migration System**:
    - Create `migrations/` folder.
    - Write `001_initial_schema.sql` with `applications` and `configurations` tables.
    - Implement `migrations.py` to run these SQL files.

4.  **Domain Models**:
    - Define Pydantic models for `Application` and `Configuration` in `models.py`.

5.  **API Implementation**:
    - Implement routes in `routers.py` for:
        - `applications` (CRUD)
        - `configurations` (CRUD)
    - Wire up routes to `main.py`.

6.  **Makefile**:
    - Create targets:
        - `run`: `uv run uvicorn src.config_service.main:app --reload`
        - `test`: `uv run python -m pytest`
        - `migrate`: `uv run python -m src.config_service.migrations`

## Data Models Review

**Applications**
- `id`: ULID (PK)
- `name`: VARCHAR(256) UNIQUE
- `comments`: VARCHAR(1024)

**Configurations**
- `id`: ULID (PK)
- `application_id`: ULID (FK -> applications.id)
- `name`: VARCHAR(256) (Unique per application)
- `comments`: VARCHAR(1024)
- `config`: JSONB
