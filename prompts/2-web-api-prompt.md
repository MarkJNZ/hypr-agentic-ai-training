You are an expert software architect and engineer.

Please create a comprehensive implementation plan for a new REST Web API service called "Config Service".

The plan should include:
- A detailed file and folder structure.
- A list of dependencies with EXACT version pins.
- Architectural patterns and design decisions.

## Strict Requirements

You must strictly adhere to ALL details provided below. Do NOT add any additional dependencies or deviation from these specs without explicit approval.

### Tech Stack
| Area                 | Choice     | Version |
|----------------------|------------|---------|
| Language             | Python     | 3.13.5  |
| Web framework        | Fast API   | 0.116.1 |
| Validation           | Pydantic   | 2.11.7  |
| Service config       | Pydantic   | 2.11.7  |
| Testing framework    | pytest     | 8.4.1   |
| Testing HTTP helper  | httpx      | 0.28.1  |
| Database engine      | PostgreSQL | v16     |
| Python DB adapter    | psycopg2   | 2.9.10  |

**Note**: It is very IMPORTANT to include these SPECIFIC version numbers.

### Data Models

**Applications** (DB Table: `applications`)
- `id`: (primary key) datatype: string/ULID
- `name`: unique datatype: string(256)
- `comments`: datatype: string(1024)

**Configurations** (DB Table: `configurations`)
- `id`: (primary key) datatype: string/ULID
- `application_id`: (foreign key) datatype: string/ULID
- `name`: datatype: string(256) expected to be unique per application
- `comments`: datatype: string(1024)
- `config`: Dictionary with name/value pairs datatype: JSONB

### API Endpoints
All endpoints should be prefixed with `/api/v1`.

**Applications**
- `POST /applications`
- `PUT /applications/{id}`
- `GET /applications/{id}` (includes list of all related `configuration.id`s)
- `GET /applications`

**Configurations**
- `POST /configurations`
- `PUT /configurations/{id}`
- `GET /configurations/{id}`

### Data Persistence
- **NO ORM**. Manage and issue SQL statements directly.
- The connection pool should use the following components:
    - `psycopg2.pool.ThreadedConnectionPool`
    - `concurrent.futures.ThreadPoolExecutor`
    - `contextlib.asynccontextmanager`
    - `psycopg2.extras.RealDictCursor` as the cursor_factory
- Use `pydantic_extra_types.ulid.ULID` as the primary key for applications.
    - dependency: `python-ulid>=2.0.0,<3.0.0` wrapped by Pydantic ULID.

### Data Schema / Migrations
Implement a migration system that includes:
- A `migrations` database table.
- A `migrations/` folder to hold `*.sql` migration files.
- A `migrations.py` file to implement the migration system.
- A `migrations_test.py` file to test the migration system.

### Automated Testing
- ALL code files MUST have an associated unit test (NOT `__init__.py` files) focusing on 80% coverage of important scenarios.
- Tests must have a `_test.py` suffix and be located in the SAME folder as the unit under test.
- A `test/` folder should ONLY contain test helpers, widely used mocks, and/or integration tests (create only if needed).

### Dates and Times
- Use the most up-to-date Python documentation (no deprecated APIs).

### Service Configuration
- Use a `.env` file for environment variables (DB config, logging, etc).
- Use `pydantic-settings` (>=2.0.0,<3.0.0) to parse/validate.

### Developer Experience
- Use `uv` for managing virtual environments, external dependencies, and script running.
- Do NOT use `pip` or `uv pip` - only `uv` directly (e.g. `uv add`, `uv sync`).
- A `Makefile` with targets for all common tasks (`test`, `run`, etc).
- Use `uv` module calling syntax in Makefile (e.g. `uv run python -m pytest`).

If you need any more information to create this plan, please ask!
