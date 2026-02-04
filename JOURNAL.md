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
