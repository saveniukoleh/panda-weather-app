
# Application Architecture

## 1. Architecture Goals

The application should follow a modular, maintainable, and testable architecture.

Main goals:

- Separation of concerns.
- Reusable Vue components.
- Independent weather widget state.
- Centralized API communication.
- Predictable state management.
- Strong TypeScript typing.
- Minimal unnecessary dependencies.

## 2. Technology Decisions

| Area | Technology |
|---|---|
| Framework | Vue 3 |
| Language | TypeScript |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router, if required |
| Charts | Chart.js |
| Localization | Vue I18n |
| HTTP | Fetch API |
| Testing | Vitest |
| Styling | Native CSS |

No CSS framework or UI component library is allowed.

## 3. Proposed Directory Structure

```text
src/
├── assets/
│   ├── icons/
│   └── images/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── weather/
│   ├── charts/
│   └── favorites/
│
├── composables/
│
├── services/
│   ├── api/
│   ├── weather/
│   └── geolocation/
│
├── stores/
│
├── types/
│
├── utils/
│
├── locales/
│
├── views/
│
├── router/
│
├── styles/
│
├── App.vue
└── main.ts
```

## 4. Main Modules

### 4.1. Application Layer

Responsible for:

- Application initialization.
- Global layout.
- Navigation.
- Global configuration.
- Shared application-level state.

### 4.2. Weather Module

Responsible for:

- City selection.
- Weather data retrieval.
- Weather data normalization.
- Weather display.
- Forecast mode switching.

### 4.3. Favorites Module

Responsible for:

- Adding favorite cities.
- Removing favorite cities.
- Favorite limits.
- Persistence in localStorage.
- Favorite weather widgets.

### 4.4. Chart Module

Responsible for:

- Chart.js initialization.
- Chart configuration.
- Dataset updates.
- Chart instance cleanup.

### 4.5. Localization Module

Responsible for:

- English translations.
- Ukrainian translations.
- Language selection.
- Localized weather descriptions.

## 5. Weather Widget Isolation

Each weather widget must have an independent identity and state.

Suggested widget model:

```ts
interface WeatherWidgetState {
  id: string;
  location: CityLocation | null;
  loading: boolean;
  error: string | null;
  forecast: WeatherForecast | null;
  displayMode: 'day' | 'five-days';
}
```

The actual model may be adjusted during implementation.

Important rules:

- Widget identifiers must be stable.
- Do not use array indexes as widget identifiers.
- A request in one widget must not overwrite another widget's data.
- Removing one widget must not affect other widgets.
- Loading and errors must be scoped to the relevant widget.

## 6. State Management

Pinia should manage shared application state.

Proposed stores:

- `weatherWidgetsStore`
- `favoritesStore`
- `settingsStore`

Local component state should be used for temporary UI details when global state is unnecessary.

Avoid storing duplicate copies of the same data.

## 7. API Service Layer

Vue components must not contain raw OpenWeatherMap request logic.

Suggested responsibilities:

- `geocodingService`: city search.
- `weatherService`: current weather and forecast requests.
- `locationService`: IP-based location detection.

Services return typed data or throw normalized errors.

## 8. Data Flow

1. User enters a city name.
2. Autocomplete requests matching locations.
3. User selects a location.
4. The widget requests weather data.
5. The service normalizes the API response.
6. The widget state is updated.
7. The weather card and chart display the result.

## 9. Chart Lifecycle

Chart.js instances must be managed explicitly.

- Create the chart after the canvas is available.
- Update the existing chart when datasets change.
- Do not create unnecessary duplicate instances.
- Destroy the chart when its component unmounts.
- Handle empty datasets safely.

## 10. Persistence

Favorites and user settings should be persisted in localStorage.

Do not persist large weather API responses unless there is a clear requirement.

Validate persisted data before using it.

## 11. Error Handling

Use a consistent error model.

Possible error categories:

- Network error.
- API authentication error.
- Rate limit.
- City not found.
- Invalid response.
- Unknown error.

Errors should be displayed in the relevant widget or application area.

## 12. Architecture Constraints

- Avoid monolithic Vue components.
- Avoid direct API requests inside presentation components.
- Avoid unnecessary abstractions.
- Avoid duplicated business logic.
- Keep components focused.
- Use TypeScript instead of unnecessary `any`.
- Do not introduce additional libraries without a clear reason.

## 13. Architecture Evolution

This document describes the initial architecture.

If implementation reveals a better approach:

1. Explain the reason.
2. Identify affected modules.
3. Update this document.
4. Obtain approval before changing major architectural decisions.
