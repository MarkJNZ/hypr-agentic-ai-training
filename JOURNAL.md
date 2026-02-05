# Journal for Agentic AI Training Course

## Journal Entry 1: Create Prompt for Config API Service

- Prompt: Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
- Tool: Antigravity
- Mode: Plan
- Context: Clean
- Model: Gemini 3 Pro (High)
- Input: prompts/1-web-api-specs.md
- Output: prompts/2-web-api-prompt.md
- Cost: Minimal
- Reflections: Created a prompt for the Config API Service based on the specifications in @/prompts/1-web-api-specs.md. The prompt is majorly a translation of the specifications into a prompt that can be used to create an implementation plan for the service. Strict adherence to the specifications is emphasized in the prompt.

## Journal Entry 2: Create Plan for Config API Service

- Prompt: Read @/prompts/2-web-api-prompt.md and follow the instructions at the top of the file.
- Mode: Plan
- Context: Clean
- Input: prompts/2-web-api-specs.md
- Output: prompts/3-web-api-plan.md
- Cost: Moderate
- Reflections: Created a plan for the Config API Service based on the prompt in @/prompts/2-web-api-prompt.md. The prompt contains a detailed phased implementation steps. The proposed project structure is not ideal

## Journal Entry 3: Create Config API Service

- Prompt: Please create a Config API Service in the `config-service` folder, according to the Implementation Plan defined in @/prompts/3-web-api-plan.md
- Mode: Planning
- Context: Clean
- Model: Gemini 3 Flash
- Input: prompts/3-web-api-plan.md
- Output: config-service/
- Cost: High
- Reflections: Ran into issues with installing and finding uv for package installation. Also experienced failed tests. There was a significant number of reviews required for suggested changes while the agent attempting to resolve these issues. 

## Journal Entry 4: Create Plan for Admin UI

- Prompt: Read @/prompts/4-admin-ui-prompt.md and follow the instructions at the top of the file.
- Tool: Antigravity
- Mode: Plan
- Context: Clean
- Model: Gemini 3 Pro (High)
- Input: prompts/4-admin-ui-prompt.md
- Output: prompts/5-admin-ui-plan.md
- Cost: Moderate
- Reflections: Created a plan for the Admin UI based on the prompt in @/prompts/4-admin-ui-prompt.md. The prompt contains a detailed phased implementation steps including class project structure. Dependency versions not included. UI Views for getting a single application or configuration by Id seem to be missing.

## Journal Entry 5: Create Admin UI

- Prompt: Read @/prompts/5-admin-ui-plan.md and follow the instructions at the top of the file.
- Tool: Antigravity
- Mode: Planning
- Context: Clean
- Model: Gemini 3 Pro (High)
- Input: prompts/5-admin-ui-plan.md
- Output: ui/

## Journal Entry 6: Development Environment Setup

- Prompt: setup development environment including config-service the postgres database and the ui
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: N/A
- Output: N/A
- Reflections: Setting up the full stack development environment. Identified config-service using FastAPI/Uvicorn and Postgres. UI using Vite. Ensuring all services are running and connected.



## Journal Entry 7: Fix 500 Error in POST /applications

- Prompt: creating a application using the config-service endpoint /applications POST is failing returning error code 500 internal server error, fix this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/
- Output: config-service/reproduce_500.py, config-service/src/config_service/models.py
- Reflections: Debugged a 500 error in the config-service. Created a reproduction script which confirmed the issue. Identified that `ulid.ULID` objects were not being correctly serialized to JSON by Pydantic. Added a `PlainSerializer` to the `ULID` type in `models.py` to fix the issue. Verified the fix with the reproduction script.

## Journal Entry 8: Fix Empty Body in GET /applications

- Prompt: config-service endpoint /applications GET command does not work, it returns a 200 status code but the body is empty
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/
- Output: config-service/src/config_service/db.py
- Reflections: Debugged an issue where `GET /applications` returned an empty body after a successful POST. The root cause was in `db.py`: `execute_query` was not committing transactions when the query returned rows (like `INSERT ... RETURNING`), causing the data to be lost. Existing unit tests passed because they mocked the database layer, masking the transaction commit issue. Created a reproduction script to confirm the bug and verify the fix. Modifying `execute_query` to commit even when rows are returned solved the problem.

## Journal Entry 9: Fix 422 Error in POST /configurations

- Prompt: enpoint /configurations POST returns a 422 error code repsonse when executing please investigate and fix any errors with this endpoint
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/
- Output: config-service/src/config_service/models.py, config-service/reproduce_issue.py
- Reflections: Debugged a 422 error on `POST /configurations`. Identified two issues: library rejected lowercase ULIDs, and API missed camelCase aliases in request bodies. Updated `models.py` with a `BeforeValidator` for flexible ULID parsing and `alias_generator` for camelCase support. Verified with a reproduction script.

## Journal Entry 10: Fix 404 Error on Application Creation

- Prompt: the ui returns a 404 not found response when creating an application and consuming the /applications POST endpoint, fix this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: ui/src/services/api.ts
- Output: ui/src/services/api.ts
- Reflections: Debugged a 404 error when creating applications from the UI. Identified that the UI was making requests to `/api/applications` (proxied to `/applications`), but the backend was configured with a global prefix `/api/v1`, expecting `/api/v1/applications`. The `ApiService` in the UI was missing the `/v1` segment in its base URL construction. Updated `ui/src/services/api.ts` to prepend `/api/v1` to all requests, ensuring alignment with the backend configuration. This fix applies to all API endpoints consumed by the UI.

## Journal Entry 11: Fix 404 Error (Proxy Configuration)

- Prompt: create application in http://localhost:5174/#apps/create in the ui returns a status code of 404, resolve this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: ui/vite.config.ts
- Output: ui/vite.config.ts
- Reflections: Although `api.ts` was updated to send requests to `/api/v1/...`, the Vite proxy configuration was stripping the `/api` prefix, resulting in requests to `/v1/...` which failed. Removed the `rewrite` rule from `vite.config.ts` to ensure that requests to `/api/...` are proxied correctly to `http://localhost:8000/api/...`, preserving the full path structure expected by the backend.

## Journal Entry 12: Fix 405 Error on Application Deletion

- Prompt: Deleting an application in http://localhost:5174/#apps and confirming action in the popup dialogue in the ui returns a 405 method not allowed error, please fix this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/src/config_service/api/routers.py
- Output: config-service/src/config_service/api/routers.py
- Reflections: Debugged a 405 Method Not Allowed error when deleting applications. The backend was missing the `DELETE` endpoint for applications. Implemented the `@router.delete("/applications/{id}")` endpoint in `routers.py`. Added logic to delete associated configurations using a Common Table Expression (CTE) to handle the deletion atomically, as there was no ON DELETE CASCADE in the schema. Verified the fix by creating a test application and successfully deleting it via the API.

## Journal Entry 13: Fix Blank Configuration Page

- Prompt: add configuration http://localhost:5173/#configs/create/01KGKHZYVMQBQ9Z159W09K4706 returns a blank page when it should present a form to add/create new configuration and use the /configurations POST endpoint of the config-service, fix this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: ui/src/components/admin-app.ts
- Output: ui/src/components/admin-app.ts
- Reflections: Debugged a blank page issue when navigating to the 'Create Configuration' route. Identified that the `config-editor` web component was not being imported in the main routing file `admin-app.ts`, preventing the browser from rendering the component. Added the missing import `import './config-editor';` to `admin-app.ts`. Also verified that the component correctly constructs the payload and calls the `POST /configurations` endpoint as expected by the backend.

## Journal Entry 14: Fix Configuration List Display

- Prompt: list config in cpnfig list for applicationhttp://localhost:5173/#apps/01KGKHZYVMQBQ9Z159W09K4706 in the ui is not displaying a list of config for the application id. The config service endpoints are functioning as expected so this looks like an issue with the ui application, please fix this
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Flash
- Input: ui/src/models/types.ts, ui/src/components/app-detail.ts, ui/src/components/config-editor.ts
- Output: ui/src/models/types.ts, ui/src/components/app-detail.ts, ui/src/components/config-editor.ts
- Reflections: Identified a naming mismatch between the backend and UI. The backend returns camelCase properties (e.g., `configurationIds`, `applicationId`) due to Pydantic alias generation, but the UI was coded to expect snake_case. Updated the TypeScript interfaces and the `AppDetail` and `ConfigEditor` components to use camelCase, which fixed the data binding issue and restored the display of configurations.

## Journal Entry 15: Remove Configuration Delete Buttons

- Prompt: remove the delete buttons from the config list in the ui at http://localhost:5173/#apps/01KGKHZYVMQBQ9Z159W09K4706 as there is no config-service endpoint for this delete action
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: ui/src/components/app-detail.ts
- Output: ui/src/components/app-detail.ts
- Reflections: Removed the "Delete" buttons from the configuration list in the application details view because the backend `config-service` does not support deleting individual configurations. Updated `app-detail.ts` to remove the UI elements, their associated event listeners, and the unused `confirmDelete` method and `<confirmation-dialog>` element. Fixed minor syntax errors that occurred during the cleanup process.

## Journal Entry 16: Fix 500 Error and Documentation

- Prompt: the ui at http://localhost:5173/ has an internal server error status code 500 when starting up and displaying the applications page. The GET request to http://localhost:5173/api/v1/applications which is an endpoint of the config service appears to be failing. Shouldn't this endpoint for the config-service be localhost:8000. Please fix this error
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/, ui/vite.config.ts, READEME.md
- Output: config-service/.env, config-service/.env.example, ui/vite.config.ts, READEME.md
- Reflections: Resolved a persistent 500 error preventing the UI from accessing the backend. Identified multiple root causes: port mismatch (Docker 5433 vs Config Service default 5432), IPv6/IPv4 resolution issues on localhost, and missing database migrations (table pplications did not exist). Fixed the schema by running migrations. Fixed connectivity by creating a .env file enforcing 127.0.0.1:5433 and updating ite.config.ts proxy to explicitly use 127.0.0.1. Finally, updated READEME.md with comprehensive "First Time Setup" instructions and created a .env.example file to prevent recurrence.

## Journal Entry 17: Implement Basic Authentication

- Prompt: add basic authentication using a username and password to the config-service. Add a login page to the ui which is the first page to be displayed to the user when accessing the application ui. The username and password must be stored in the postgres database. The password must be stored encrypted in the database using SHA-256 to encrypt the password.
- Mode: Execution
- Context: Existing Codebase
- Model: Gemini 3 Pro (High)
- Input: config-service/, ui/
- Output: config-service/migrations/002_create_users_table.sql, config-service/src/config_service/auth.py, config-service/src/config_service/api/routers.py, ui/src/services/auth.ts, ui/src/components/login-page.ts, ui/src/components/admin-app.ts
- Reflections: Implemented Basic Auth for both backend and frontend. Created a users table and updated APIs to require authentication. Added a Login page and route guards in the UI. During the process, I inadvertently included default credentials in the README and migration comments, which the user flagged as a security risk. I promptly removed these secrets from the codebase and documentation, reinforcing the importance of not committing secrets to source control even for default/dev credentials. Verified the solution with backend scripts and manual UI checks.
