# Admin UI Prompt

Create an implementation plan for an admin web interface that has features for adding and updating application entries as well as adding and updating the configuration name/value pairs.

## Requirements
### API Endpoints
- Use `@config-service/src/config_service/api/routers.py` to understand which endpoints and payloads are available.
- All endpoints are prefixed with `/api/v1`

**Applications**
  - POST `/applications`
  - PUT `/applications/{id}`
  - GET `/applications/{id}` (includes list of all related configuration.ids)
  - GET `/applications`

**Configurations**
  - POST `/configurations`
  - PUT `/configurations/{id}`
  - GET `/configurations/{id}`

### Data Models

**Application**
    - id: (primary key)
    - name: string(256)
    - comments: string(1024)

**Configuation**
    - id: (primary key)
    - application_id: (foreign key)
    - name: string(256) expected to be unique per application
    - comments: string(1024)
    - config: Dictionary with name/value pairs

### Technical Details

**Technology Stack**
- Use pnpm to manage dependencies and run scripts.
- All code should either be TypeScript, HTML, or CSS. Do not use JavaScript directly.
- Only use the Web Components functionality built into the browser, do not use external css frameworks such as React and Vue.
- Only use the `fetch` feature of  modern browsers. 
- For styling - only CSS and the Shadow DOM. 
- Create unit tests with vitest and integration tests with Playwright.
- Ensure the UI is responsive and works on both desktop and mobile devices.

### User Experience
**Application Management UI**
- List view showing all applications with search/filter
- Create form for new applications
- Edit form for existing applications
- Delete confirmation dialogs
- View application details with associated configurations

**Configuration Management UI**
- List view of configurations for each application
- Create form for new configurations with dynamic key-value editor
- Edit form for existing configurations
- JSON editor for complex configuration values
- Validation for required fields and data types

### Development 
**Project Structure**
- Clear separation of components, services, and utilities
- TypeScript interfaces for all data models
- Comprehensive test coverage (unit and integration)
- Development server with hot reload
- Build process for production deployment

**Code Quality**
- ESLint and Prettier configuration
- Type checking with TypeScript strict mode
- Error boundaries and graceful error handling
- Accessibility compliance (ARIA labels, keyboard navigation)

Create a detailed implementation plan that addresses all these requirements