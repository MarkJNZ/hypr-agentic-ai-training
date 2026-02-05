# hypr-agentic-ai training

A repo for the exercises worked through during the hypr-agentic-ai training course.

## Getting Started

### Prerequisites

-   Docker & Docker Compose
-   Python 3.11+ (managed via `uv`)
-   Node.js 18+ & pnpm

### Running the Application

1.  **Start the Database**:
    ```bash
    docker-compose up -d
    ```

2.  **Start the Config Service**:
    ```bash
    cd config-service
    make setup  # First time only
    make migrate # Run database migrations
    make run
    ```
    The API will be available at `http://localhost:8000`.

3.  **Start the UI**:
    ```bash
    cd ui
    pnpm install # First time only
    pnpm dev
    ```
    The UI will be available at `http://localhost:5173`.