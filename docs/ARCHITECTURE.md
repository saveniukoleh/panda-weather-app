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
| --- | --- |
| Framework | Vue 3 |
| Language | TypeScript |
| Build tool | Vite |
| State management | Pinia |
| Routing | Not required for the two-tab shell; tab state is application state |
| Charts | Chart.js |
| Localization | Vue I18n |
| HTTP | Fetch API |
| Weather API proxy | Cloudflare Worker (Wrangler) |
| Testing | Vitest |
| Styling | Native CSS |

No CSS framework or UI component library is allowed.

Vue Router remains unused unless a later requirement needs URL-addressable views. Weather and Favorites tabs do not require routes.

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

`src/router/` is reserved. It stays unused while navigation is tab state.

`worker/` is the Cloudflare Worker proxy (`worker/src`, `worker/wrangler.toml`). Vite does not bundle it. The OpenWeatherMap API key exists only as the Worker secret `OPENWEATHER_API_KEY`.

Normalized types live in `src/types/`. Services must not leak raw OpenWeatherMap response types into Vue components.

## 4. Main Modules

### 4.1. Application Layer

Owns:

- Application bootstrap in `main.ts`.
- Root `App.vue` composition of layout and the active view.
- Header, language control, and Weather / Favorites tab switching.
- Shared settings (selected language; later Day / Night display if implemented).
- Global CSS and design-unrelated document defaults.

Does not own:

- OpenWeatherMap requests.
- Per-widget forecast state.
- Favorite city persistence rules beyond invoking the favorites store.

### 4.2. Weather Module

Owns:

- Dashboard widget collection (default 1, maximum 5).
- Independent widget identity and state.
- City autocomplete selection for a single widget.
- Requesting and displaying current-day weather and forecast for the selected city.
- Day / 5 Days switching per widget.
- Widget add and remove flows, including the last-widget rule.

Does not own:

- Favorite persistence.
- Chart.js instance lifecycle (delegated to the chart module).
- Application-wide language persistence.

### 4.3. Favorites Module

Owns:

- The list of saved cities.
- Duplicate prevention and the five-city limit.
- localStorage persistence and restore validation.
- Favorites view presentation of saved cities as widgets without city search.

Does not own:

- Dashboard widget collection.
- Persisting forecast payloads.

### 4.4. Chart Module

Owns:

- Direct Chart.js usage (no Vue wrapper).
- Canvas initialization, dataset updates, empty-state handling, and destroy-on-unmount.
- One chart instance per widget canvas.

Does not own:

- Forecast grouping or daily average calculation.
- API access.

### 4.5. Localization Module

Owns:

- English and Ukrainian UI strings.
- Language switching and persistence of the selected language.
- Passing the selected language into weather API requests.

Does not own:

- Mapping OpenWeatherMap `lang` values beyond providing the current locale code (`en` | `uk`).

### 4.6. API Module

Owns:

- HTTP access to the Cloudflare Worker proxy, which calls OpenWeatherMap.
- Request configuration, AbortSignal support, response validation, and error normalization.
- Later, mapping validated provider payloads into application data models.

Does not own:

- The OpenWeatherMap API key.
- Vue component state.
- User-facing copy (services throw typed errors; UI maps them to i18n strings).

## 5. Component Responsibilities

Components stay small. Presentation components do not call `fetch` or import OpenWeatherMap URLs.

| Component | Location | Responsibility | Must not |
| --- | --- | --- | --- |
| `App.vue` | root | Mount layout and the active tab view | Contain weather business logic |
| `AppLayout` | `components/layout` | Page frame: header, nav, main | Fetch data |
| `AppHeader` | `components/layout` | Title and settings controls | Own widget state |
| `AppNav` | `components/layout` | Weather / Favorites tabs | Route via Vue Router |
| `WeatherView` | `views` | Dashboard: widget list, add-widget control, five-widget limit UI | Persist favorites |
| `FavoritesView` | `views` | Favorite widgets and empty favorites state | Include city search |
| `WeatherWidget` | `components/weather` | One independent weather unit: search or locked city, card, chart, mode switch, favorite/remove | Share state with other widgets |
| `CitySearch` | `components/weather` | Debounced autocomplete and selection | Apply selection to more than one widget |
| `WeatherCard` | `components/weather` | Current or selected-day snapshot | Request weather |
| `ForecastModeSwitch` | `components/weather` | Day / 5 Days for that widget only | Change other widgets |
| `TemperatureChart` | `components/charts` | Chart.js lifecycle for one canvas | Use vue-chartjs |
| `AppButton`, `LoadingIndicator`, `ErrorMessage`, `ConfirmModal`, `EmptyState` | `components/common` | Shared UI primitives | Encode weather rules |

Favorite widgets reuse `WeatherWidget` with search disabled. Removal from Favorites removes the saved city, not a dashboard widget.

Widget removal and the favorites-limit dialog use `ConfirmModal`. Cancel leaves state unchanged.

Temporary UI (autocomplete query text, modal open flags) stays in component state. Shared collections use Pinia.

## 6. Application Data Models

These are the normalized models. Raw API DTOs stay inside the service layer.

```ts
type LocaleCode = 'en' | 'uk';

type ForecastMode = 'day' | 'five-days';

type AppErrorCode =
  | 'network'
  | 'unauthorized'
  | 'not_found'
  | 'rate_limit'
  | 'invalid_request'
  | 'invalid_response'
  | 'unknown';

interface AppError {
  code: AppErrorCode;
  message: string;
}

interface CityLocation {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface WeatherCondition {
  description: string;
  icon: string;
}

interface WeatherSnapshot {
  temperatureC: number;
  feelsLikeC: number | null;
  humidity: number | null;
  windSpeed: number | null;
  pressure: number | null;
  condition: WeatherCondition | null;
}

interface ForecastEntry {
  timestampUnix: number;
  temperatureC: number;
  condition: WeatherCondition | null;
  precipitationProbability: number | null;
}

interface DailyForecast {
  localDate: string;
  averageTemperatureC: number;
  condition: WeatherCondition | null;
  entryCount: number;
}

interface WeatherForecast {
  location: CityLocation;
  timezoneOffsetSeconds: number;
  current: WeatherSnapshot | null;
  entries: ForecastEntry[];
  daily: DailyForecast[];
}
```

Identity and grouping rules:

- A city is unique by `lat` and `lon`. Duplicate favorites use that pair, not the display name.
- `localDate` is `YYYY-MM-DD` in the **city** timezone (`timezoneOffsetSeconds`), not the browser timezone.
- Current-day chart data is the `entries` whose local calendar date is the city’s current local date.
- Daily average temperature is the arithmetic mean of `temperatureC` for entries on that local date.
- Missing optional fields are `null`. UI hides unavailable parameters instead of inventing values.
- Units are metric (Celsius). Wind speed uses the unit returned by the metric API configuration and is labeled accordingly at implementation time.

## 7. Weather Widget State

Dashboard widgets are session state in `weatherWidgetsStore`. Forecast payloads are not written to localStorage.

```ts
interface WeatherWidgetState {
  id: string;
  location: CityLocation | null;
  loading: boolean;
  error: AppError | null;
  forecast: WeatherForecast | null;
  displayMode: ForecastMode;
}

interface WeatherWidgetsStoreState {
  widgets: WeatherWidgetState[];
}
```

Collection rules:

- On first load, create exactly one widget.
- Maximum dashboard widgets: 5.
- `id` is a stable unique string (not the array index).
- Adding a widget appends a new independent `WeatherWidgetState`.
- Removing a widget requires confirmation and deletes only that `id`.
- The last remaining dashboard widget cannot be removed.

Isolation rules:

- Loading, errors, location, forecast, and `displayMode` are per widget.
- A response may update a widget only if it still exists and the request belongs to that `id` (ignore stale responses).
- Autocomplete in one widget never writes another widget’s `location`.

Favorites view widgets are **ephemeral runtime state** keyed by city `lat`/`lon`. They share the same per-widget fields (`loading`, `error`, `forecast`, `displayMode`) but are not the dashboard collection and are not persisted. Only the city list is persisted.

## 8. Favorites State

```ts
interface FavoritesState {
  cities: CityLocation[];
}

const MAX_FAVORITES = 5;
const FAVORITES_STORAGE_KEY = 'panda-weather.favorites';
```

Rules:

- Maximum 5 cities.
- A city is already a favorite when `lat` and `lon` match an entry.
- Adding a duplicate is a no-op at the store level; the UI may still show favorite status.
- Adding when `cities.length === MAX_FAVORITES` is rejected. The UI shows the limit modal and does not add.
- Removing a city deletes only that `lat`/`lon` entry.
- Persist `cities` only (locations, not forecasts).
- On startup, read `FAVORITES_STORAGE_KEY`, parse JSON, and validate shape (`name`, `country`, `lat`, `lon` numbers; optional `state`). Invalid or unreadable storage yields `[]`.
- Unavailable `localStorage` must not crash the app; keep in-memory state and skip persistence.

`favoritesStore` exposes add, remove, `isFavorite(city)`, and `hasReachedLimit`. Weather widgets call these; they do not access `localStorage` directly.

## 9. State Management

Pinia stores:

| Store | State | Persistence |
| --- | --- | --- |
| `weatherWidgetsStore` | Dashboard `WeatherWidgetState[]` | None |
| `favoritesStore` | `FavoritesState` | localStorage, cities only |
| `settingsStore` | `locale: LocaleCode` (and later Day / Night if defined) | localStorage |

Do not duplicate the same city list or the same forecast in multiple stores. Dashboard widgets and favorite cities may refer to the same `CityLocation` value object, but each view keeps its own forecast runtime state.

## 10. API Service Boundaries

Vue components and Pinia stores do not call OpenWeatherMap or the Worker directly. They use services. Endpoints, query parameters, and plan limits are defined in `API_INTEGRATION.md`.

### 10.1. Cloudflare Worker — `worker/`

- Holds `OPENWEATHER_API_KEY` as a Wrangler secret. The key is not a Worker var, a Vite variable, or part of the frontend bundle.
- Accepts `GET`, plus CORS `OPTIONS`, for `/geocoding`, `/weather`, and `/forecast` only.
- Validates query parameters, then calls the matching OpenWeatherMap URL with `appid` and `units=metric`.
- Allows `https://saveniukoleh.github.io`, origins listed in `ALLOWED_ORIGINS`, and local `http://localhost` or `http://127.0.0.1` on any port. Other origins are rejected before a provider request.
- CORS is only a browser control. The route and parameter allowlist is what prevents an open proxy.
- Returns JSON. Failures use `{ error: { code, message } }` with a fixed message. Upstream error bodies, redirects, and any payload containing the API key are not returned.

### 10.2. `services/api` — HTTP client

- Reads `import.meta.env.VITE_API_BASE_URL` (the Worker base URL). It does not read an OpenWeatherMap API key.
- Calls the Worker routes in section 10.1 with `fetch` and an optional `AbortSignal`.
- Lets abort errors propagate. Maps transport failures, HTTP errors, and malformed JSON to `AppError`.
- Validates successful JSON before returning it. Phase 3.1 returns validated provider payloads; `WeatherForecast` normalization comes later.
- Does not return raw `Response` objects to feature code.

### 10.3. `geocodingService` — `services/weather`

- Calls `requestGeocoding`. It does not send `appid` or repeat payload validation.
- **Input:** `{ query: string; limit?: number; signal?: AbortSignal }`.
- **Output:** `CityLocation[]`. An empty provider result is `[]`, not an error.
- **Throws:** `AppRequestError` for transport and HTTP failures. `AbortError` propagates unchanged.
- `useCitySearch` debounces for 300ms, skips queries shorter than 2 characters after trimming, cancels the previous request, and ignores stale responses. A selected city stops further requests until the query changes or the search is reset.

### 10.4. `weatherService` — `services/weather`

- Calls the API client. It does not send `appid`.
- **Input:** `{ location: CityLocation; locale: LocaleCode; signal?: AbortSignal }`.
- **Output:** `WeatherForecast` (normalized current snapshot when used, 3-hour `entries`, grouped `daily`, `timezoneOffsetSeconds`).
- Uses the 5-day / 3-hour forecast endpoint. A separate current-weather request is allowed only if implementation confirms it is required for an accurate current snapshot.
- Converts timestamps with the city timezone offset before grouping by local date.
- **Throws:** `AppError`. Incomplete payloads that cannot be normalized are `invalid_response`.

### 10.5. `locationService` — `services/geolocation`

- Optional automatic location (later phase).
- **Output:** `CityLocation` or a documented fallback city.
- Must not block application startup indefinitely.
- Provider selection remains pending; this boundary exists so UI never talks to the geolocation HTTP API directly.

Services return normalized data or throw `AppError`. They do not toast, open modals, or write Pinia state.

## 11. Data Flow

1. User enters a city name in one widget’s search field.
2. A debounced geocoding request returns `CityLocation[]`.
3. The user selects a location; only that widget’s `location` is set.
4. `weatherService` loads a `WeatherForecast` for that widget `id`.
5. The widget stores the forecast or an `AppError`.
6. `WeatherCard` and `TemperatureChart` render from that widget’s state and `displayMode`.

## 12. Chart Lifecycle

Chart.js instances must be managed explicitly.

- Create the chart after the canvas is available.
- Update the existing chart when datasets change.
- Do not create unnecessary duplicate instances.
- Destroy the chart when its component unmounts.
- Handle empty datasets safely.

## 13. Persistence

Favorites and user settings should be persisted in localStorage.

Do not persist large weather API responses unless there is a clear requirement.

Validate persisted data before using it.

## 14. Error Handling

Use `AppError` consistently.

| Code | Typical cause |
| --- | --- |
| `network` | Fetch failed (offline, DNS, abort after user-visible failure) |
| `unauthorized` | HTTP 401 — the Worker reported that OpenWeatherMap rejected the credentials |
| `invalid_request` | HTTP 400 |
| `not_found` | HTTP 404 or no usable location |
| `rate_limit` | HTTP 429 |
| `invalid_response` | Unexpected JSON shape |
| `unknown` | Anything else |

Widget-scoped failures update that widget’s `error`. Favorites-limit and widget-removal confirmations are UI flows, not `AppError`.

Do not show raw HTTP or stack messages to users. Map `AppError.code` to i18n strings during the localization phase.

## 15. Architecture Constraints

- Avoid monolithic Vue components.
- Avoid direct API requests inside presentation components.
- Avoid unnecessary abstractions.
- Avoid duplicated business logic.
- Keep components focused.
- Use TypeScript instead of unnecessary `any`.
- Do not introduce additional libraries without a clear reason.
- Do not call OpenWeatherMap from the frontend, and do not put the API key in Vite variables or source.

## 16. Architecture Evolution

This document describes the agreed architecture for implementation.

If implementation reveals a better approach:

1. Explain the reason.
2. Identify affected modules.
3. Update this document.
4. Obtain approval before changing major architectural decisions.
