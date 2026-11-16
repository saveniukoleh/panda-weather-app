# Panda Weather App

A responsive weather dashboard built with Vue 3. The browser talks only to this project's Cloudflare Worker, which proxies OpenWeatherMap.

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
- Vite 6
- Pinia
- Chart.js
- Vue I18n
- Fetch API
- CSS
- Vitest
- Cloudflare Workers (Wrangler 4.86.0)

Weather and Favorites are application state. Vue Router is not used.

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

The application is implemented. Phase 9 (testing and quality assurance) is complete. Phase 10 (documentation, deployment, and final submission) is in progress. The project is being prepared for the final Panda Team assessment submission.

Phase 10.1 (this README) is the current documentation update. Deployment of the public frontend and the submission package remain open in Phase 10.2 and Phase 10.3. The Cloudflare Worker is already deployed, and `OPENWEATHER_API_KEY` is configured as a Worker secret. No deployment URL is recorded in this README.

`docs/DEVELOPMENT_PLAN.md` is the authoritative task tracker.

## Getting Started

### Prerequisites

- Node.js 20.18.2. This repository uses Vite 6 and Wrangler 4.86.0 for that runtime. Wrangler 4.87 and newer require Node.js 22, and Vite 8 requires a newer Node.js than 20.18.2.
- npm. Dependencies are locked with `package-lock.json`.

### Install dependencies

```bash
npm install
```

### Configure local environment variables

Frontend base URL: copy `.env.example` to `.env`. `.env` is gitignored. For local weather data, set the Worker URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8787
```

Worker secret: copy `worker/.dev.vars.example` to `worker/.dev.vars`. `worker/.dev.vars` is gitignored. Put your OpenWeatherMap key in `OPENWEATHER_API_KEY`. The example file is only an empty placeholder.

Do not commit `.env` or `worker/.dev.vars`.

### Run the application locally

City search and weather data require the Worker. Start both processes.

Worker:

```bash
npm run worker:dev
```

That script runs `wrangler dev --config worker/wrangler.toml`. Local Wrangler reads `worker/.dev.vars` and serves `http://127.0.0.1:8787`.

Frontend, in a second terminal:

```bash
npm run dev
```

`vite.config.ts` does not set a custom port. Vite serves the app at `http://localhost:5173` when that port is free and prints the URL in the terminal. Open that URL in a browser.

## Environment Variables

The browser never receives the OpenWeatherMap API key. Do not put real keys in source, documentation, `worker/wrangler.toml` `[vars]`, or Vite variables.

### Frontend

`VITE_API_BASE_URL` is the base URL of this project's Cloudflare Worker.

- It must not contain an OpenWeatherMap API key.
- Local development with `npm run worker:dev` uses `http://127.0.0.1:8787`.
- A production build must use the deployed Worker URL, and that URL must be `https`. The production build rejects an `http` base URL and rejects any `openweathermap.org` host.
- `.env.example` ships the variable empty. Configure a real local value only in `.env`.

### Worker

`OPENWEATHER_API_KEY` is the OpenWeatherMap key. Configure it as a Cloudflare Worker secret:

```bash
npx wrangler secret put OPENWEATHER_API_KEY --config worker/wrangler.toml
```

Local Wrangler reads the same name from `worker/.dev.vars`. `worker/.dev.vars.example` is a placeholder and is safe to commit only because its value is empty.

`ALLOWED_ORIGINS` in `worker/wrangler.toml` is not a secret. The committed value is `https://saveniukoleh.github.io`. The Worker also allows local `http://localhost` and `http://127.0.0.1`.

### Files that must never be committed

- `.env` and other `.env.*` files, except `.env.example`
- `worker/.dev.vars`
- Any file that contains a real `OPENWEATHER_API_KEY` or other API key

## API Limitations

Details and request rules are in `docs/API_INTEGRATION.md`.

- The frontend communicates only with the Cloudflare Worker.
- The Worker proxies OpenWeatherMap and adds `appid` on the server.
- Current weather, geocoding, and the five-day forecast are separate routes: `GET /weather`, `GET /geocoding`, and `GET /forecast`.
- Forecast data is the five-day product in three-hour intervals (up to 40 slots). It is not an hourly forecast. The Worker has no One Call or hourly-forecast route. Charts use the actual three-hour timestamps.
- The 24 Hours view uses available forecast entries from the current time through that time plus 24 hours, inclusive. It does not interpolate or add requests.
- Five-day averages are the arithmetic mean of available temperatures, grouped by the target city's local calendar date. Missing slots are not invented. Days without slots are omitted.
- The first dashboard widget uses approximate IP geolocation, not GPS. A failed or incomplete lookup uses the fallback city.
- CORS checks the browser `Origin`. CORS is not authentication. The Worker does not implement user authentication.
- Provider quota controls and Cloudflare rate limiting are not implemented. A provider HTTP 429 is reported as a rate-limit error when it occurs. A caller that spoofs `Origin` can still reach the three allowlisted routes.

## Additional Functionality

Implemented behavior beyond the mandatory assignment requirements:

- Five-day forecast and daily average temperatures from the available three-hour measurements.
- Favorites saved in `localStorage`, with duplicate prevention and a limit of five cities. Dashboard forecasts stay in the session.
- English and Ukrainian UI. Weather descriptions are requested with `lang=en` or `lang=uk`.
- A global Day/Night theme stored in `localStorage`. Day is the default light theme. The theme is a user setting and is independent of each widget's 24 Hours / 5 Days switch.
- Approximate IP-based location for the initial widget, with a fallback city when the lookup fails.
- Independent weather widgets, with a maximum of five. The last widget cannot be removed, and removal asks for confirmation.
- Responsive layout, including checks at 1200px, 768px, and 360px, and keyboard interactions for city-search suggestions, navigation tabs, and confirmation dialogs.
- Cloudflare Worker API proxy with the OpenWeatherMap key kept as a server-side secret.

## Assessment Requirements

The application must satisfy the original Panda Team weather application assignment.

The original task distinguishes mandatory requirements from optional enhancements. See `docs/PROJECT_SPEC.md`.

## Deployment

The public frontend deployment and the final submission URLs are still open. See Phase 10.2 and Phase 10.3 in `docs/DEVELOPMENT_PLAN.md`.

`npm run worker:deploy` runs `wrangler deploy --config worker/wrangler.toml`. Production frontend builds need `VITE_API_BASE_URL` set to that deployed `https` Worker URL. The repository URL and the deployed application URL are the final assessment deliverables once those steps are done.
