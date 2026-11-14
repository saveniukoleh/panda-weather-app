
# Panda Weather App

A responsive weather dashboard built with Vue 3 and the OpenWeatherMap API.

This project is developed as a technical assessment for Panda Team. It demonstrates frontend architecture, API integration, reactive state management, data visualization, responsive UI development, and maintainable code organization.

## Project Goals

- Search for cities with autocomplete.
- Display current weather information.
- Visualize temperature forecasts using Chart.js.
- Manage multiple independent weather widgets.
- Save and manage favorite cities.
- Support English and Ukrainian.
- Provide responsive layouts for mobile and desktop.
- Handle loading, errors, and empty states.

## Technology Stack

- Vue 3
- Composition API
- TypeScript
- Vite
- Pinia
- Vue Router (if required by the final navigation architecture)
- Chart.js
- Vue I18n
- Fetch API
- CSS
- Vitest

No CSS frameworks or UI component libraries are allowed.

## Documentation

All project specifications and development instructions are maintained in the `docs/` directory.

| Document | Description |
|---|---|
| [PROJECT_SPEC](docs/PROJECT_SPEC.md) | Functional and non-functional requirements |
| [DEVELOPMENT_PLAN](docs/DEVELOPMENT_PLAN.md) | Detailed implementation roadmap and task status |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Application architecture and code organization |
| [API_INTEGRATION](docs/API_INTEGRATION.md) | OpenWeatherMap API integration and data processing |
| [UI_UX_SPEC](docs/UI_UX_SPEC.md) | Interface, interaction, and responsive design requirements |
| [TESTING_PLAN](docs/TESTING_PLAN.md) | Testing strategy and acceptance criteria |
| [AI_INSTRUCTIONS](docs/AI_INSTRUCTIONS.md) | Instructions and workflow for AI coding assistants |

## Development Workflow

The project follows a documentation-driven, incremental development process.

1. Review the relevant specifications.
2. Select the next incomplete task in `DEVELOPMENT_PLAN.md`.
3. Check dependencies and acceptance criteria.
4. Implement only the selected task.
5. Run relevant tests and quality checks.
6. Review the implementation.
7. Update task status and documentation.
8. Proceed to the next task.

Every task should be small enough to implement, inspect, and verify independently.

## Project Status

**Current phase:** Planning and specification.

Implementation has not started.

The authoritative implementation status is maintained in `docs/DEVELOPMENT_PLAN.md`.

## Getting Started

Setup instructions will be added after the initial project configuration.

## Environment Variables

API credentials must be stored in environment variables and must never be committed to the repository.

See `docs/API_INTEGRATION.md`.

## Assessment Requirements

The application must satisfy the original Panda Team weather application assignment.

The original task distinguishes mandatory requirements from optional enhancements. See `docs/PROJECT_SPEC.md`.

## Deployment

The final application must be publicly accessible through a deployment URL.

The repository URL and deployed application URL will be submitted as the final assessment deliverables.
