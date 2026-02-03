# Admin UI Implementation Plan

## Goal Description
Create a modern, responsive Admin Web Interface for managing Applications and Configurations. The system will allow users to view, create, update, and delete applications and their associated key-value configurations.

## Technical Requirements
- **Root Directory**: `/ui`
- **Package Manager**: `pnpm`
- **Languages**: TypeScript, HTML, CSS (No raw JavaScript)
- **Frameworks**: Native Web Components (Custom Elements + Shadow DOM). No React/Vue.
- **Styling**: Vanilla CSS, Shadow DOM encapsulation.
- **Network**: Native `fetch` API.
- **Testing**: `vitest` (Unit), `playwright` (Integration).
- **Linting/Formatting**: ESLint, Prettier.

## Project Structure
```
/ui
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.ts                 # Entry point
│   ├── style.css               # Global styles (variables, reset)
│   ├── components/             # Web Components
│   │   ├── app-list.ts
│   │   ├── app-detail.ts
│   │   ├── config-list.ts
│   │   ├── config-editor.ts
│   │   ├── confirmation-dialog.ts
│   │   └── toast-notification.ts
│   ├── services/
│   │   └── api.ts              # API Client wrapper
│   ├── models/
│   │   └── types.ts            # TypeScript interfaces
│   └── utils/
│       └── validation.ts
├── tests/
│   ├── unit/                   # Vitest specs
│   └── e2e/                    # Playwright tests
└── public/
```

## Data Models (TypeScript Interfaces)

```typescript
// src/models/types.ts

export interface Application {
  id: string;
  name: string;
  comments: string;
  configuration_ids?: string[];
}

export interface ApplicationCreate {
  name: string;
  comments: string;
}

export interface ApplicationUpdate {
  name?: string;
  comments?: string;
}

export interface Configuration {
  id: string;
  application_id: string;
  name: string;
  comments: string;
  config: Record<string, any>;
}

export interface ConfigurationCreate {
  application_id: string;
  name: string;
  comments: string;
  config: Record<string, any>;
}

export interface ConfigurationUpdate {
  name?: string;
  comments?: string;
  config?: Record<string, any>;
}
```

## Implementation Steps

### Phase 1: Setup & Infrastructure
1.  Initialize `ui` directory with `pnpm init`.
2.  Install dependencies:
    -   Dev: `typescript`, `vite`, `vitest`, `playwright`, `eslint`, `prettier`.
3.  Configure `tsconfig.json` (Strict mode).
4.  Setup `vite.config.ts` (Proxy `/api` to backend).
5.  Create `src/services/api.ts` to handle generic HTTP requests (GET, POST, PUT, DELETE) with error handling.

### Phase 2: Core Components & Routing
1.  **Layout**: Create a main app shell component (`admin-app`) that handles basic routing (hash-based or custom) between views.
2.  **Shared Components**:
    -   `confirm-dialog`: Modal for delete protections.
    -   `toast-notification`: For success/error feedback.

### Phase 3: Application Management
1.  **List View (`app-list`)**: 
    -   Fetch `GET /applications`.
    -   Render grid/list of apps.
    -   Search filter input.
    -   "Create New" button.
2.  **Create/Edit (`app-form`)**:
    -   Form with validation.
    -   `POST /applications` or `PUT /applications/{id}`.

### Phase 4: Configuration Management
1.  **Detail View (`app-detail`)**:
    -   Show App metadata.
    -   List associated configurations.
2.  **Config Editor (`config-editor`)**:
    -   Dynamic Key-Value pair editor (Add/Remove rows).
    -   JSON mode toggle for complex values.
    -   Validation.
    -   `POST /configurations` or `PUT /configurations/{id}`.

### Phase 5: Styling & Polish
1.  Implement CSS Variables for theming (Colors, Spacing).
2.  Ensure Responsive capabilities (Flexbox/Grid).
3.  Add micro-interactions (hover states, transitions).
4.  Accessibility checks (ARIA attributes).

## Verification Plan

### Automated Tests
-   **Unit Tests (`vitest`)**:
    -   Test `api.ts` error handling (mock fetch).
    -   Test validation logic in `utils/validation.ts`.
    -   Test component rendering logic (using JSDOM environment).
    -   Command: `pnpm test:unit`

-   **Integration Tests (`playwright`)**:
    -   End-to-End flows against running backend.
    -   Scenario 1: Create App -> Verify in List.
    -   Scenario 2: Create Config -> Verify in Detail View.
    -   Scenario 3: Update Config -> Verify persistence.
    -   Scenario 4: Delete Flow.
    -   Command: `pnpm test:e2e`

### Manual Verification
1.  Start backend: `make run` (Config Service).
2.  Start frontend: `cd ui && pnpm dev`.
3.  Open `http://localhost:5173`.
4.  **Create App**: "Test App", "Description". Verify success toast.
5.  **Edit App**: Change name. Verify list updates.
6.  **Add Config**: Add "Theme", "Dark" key-value. Verify JSON view.
7.  **Mobile Check**: Resize browser window to mobile width. Verify layout adjusts.
