# hypr-agentic-ai training

A repo for the exercises worked through during the hypr-agentic-ai training course.

## Getting Started

### Prerequisites

-   Docker & Docker Compose
-   Python 3.11+ (managed via `uv`)
-   Node.js 18+ & pnpm
-   A [GitHub OAuth App](https://github.com/settings/developers) (for authentication)

### GitHub OAuth App Setup

1.  Go to [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2.  Set **Homepage URL** to `http://localhost:5173`
3.  Set **Authorization callback URL** to `http://localhost:5173/auth/callback`
4.  Note the **Client ID** and generate a **Client Secret**

### Running the Application

1.  **Start the Database**:
    ```bash
    docker-compose up -d
    ```

2.  **Start the Config Service**:
    ```bash
    cd config-service
    cp .env.example .env # Create env file (if example exists) or manually create it
    # Ensure .env contains:
    #   DB_URL=postgresql://postgres:postgres@127.0.0.1:5433/config_db
    #   GITHUB_CLIENT_ID=<your_github_client_id>
    #   GITHUB_CLIENT_SECRET=<your_github_client_secret>
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

### Authentication

The app uses **GitHub OAuth2** for authentication. When you visit the UI, you'll be prompted to sign in with your GitHub account. No username/password is required — just click "Sign in with GitHub" and authorize the app.