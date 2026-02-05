# Config Service

A simple REST API for managing application configurations, built with FastAPI and PostgreSQL.

## Prerequisites

- Python 3.12+
- `uv` (Python package manager)
- PostgreSQL database

## Setup

1.  **Install dependencies**:
    ```bash
    make setup
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env` and update the database URL if necessary.
    ```bash
    cp .env.example .env
    ```

## Database

The service uses PostgreSQL. Ensure your database is running and accessible via the `DATABASE_URL` in `.env`.

To set up the schema and seed default data (including the admin user):

```bash
make migrate
```

## Running the Service

To start the development server:

```bash
make run
```
The API will be available at http://localhost:8000.

## Authentication

The service uses Basic Authentication.

You can configure the initial admin user via the database seeded data.

You must authenticate to access protected endpoints (e.g., creating/editing applications and configurations).
