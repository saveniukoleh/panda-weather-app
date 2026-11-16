
# Development Plan

## Project Status

- Overall status: In Progress
- Current phase: Phase 4 — Weather Widgets
- Completed phases: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1
- Active phase: None (Phase 4.2 not started)

Task statuses:
- [ ] Not started
- [x] Completed
- [~] In progress
- [!] Blocked

---

# PHASE 1. PROJECT INITIALIZATION

## 1.1. Repository Setup

- [x] 1.1.1. Create the GitHub repository.
- [x] 1.1.2. Create the documentation directory.
- [x] 1.1.3. Add all project documentation files.
- [x] 1.1.4. Create the initial README.
- [x] 1.1.5. Create the initial .gitignore.
- [x] 1.1.6. Commit the initial documentation.

## 1.2. Development Environment

- [x] 1.2.1. Initialize a Vue 3 project using Vite.
- [x] 1.2.2. Configure TypeScript.
- [x] 1.2.3. Configure project scripts.
- [x] 1.2.4. Install required dependencies.
- [x] 1.2.5. Configure ESLint.
- [x] 1.2.6. Configure Prettier.
- [x] 1.2.7. Configure Vitest.
- [x] 1.2.8. Verify that the application starts successfully.

## 1.3. Project Configuration

- [x] 1.3.1. Create the initial source directory structure.
- [x] 1.3.2. Configure environment variables.
- [x] 1.3.3. Configure the application entry point.
- [x] 1.3.4. Configure global CSS.
- [x] 1.3.5. Verify the initial application build.

---

# PHASE 2. APPLICATION ARCHITECTURE

## 2.1. Core Architecture

- [x] 2.1.1. Define the main application modules.
- [x] 2.1.2. Define component responsibilities.
- [x] 2.1.3. Define application data models.
- [x] 2.1.4. Define widget state structure.
- [x] 2.1.5. Define favorites state structure.
- [x] 2.1.6. Define API service boundaries.

## 2.2. Application Shell

- [x] 2.2.1. Create the root App component.
- [x] 2.2.2. Create the application layout.
- [x] 2.2.3. Create the header.
- [x] 2.2.4. Create the navigation tabs.
- [x] 2.2.5. Create the main content container.
- [x] 2.2.6. Implement tab switching.

## 2.3. Shared UI Components

- [x] 2.3.1. Create reusable buttons.
- [x] 2.3.2. Create loading indicators.
- [x] 2.3.3. Create error messages.
- [x] 2.3.4. Create confirmation modal.
- [x] 2.3.5. Create empty states.
- [x] 2.3.6. Verify shared component behavior.

---

# PHASE 3. OPENWEATHERMAP INTEGRATION

## 3.1. API Configuration

- [x] 3.1.1. Configure the OpenWeatherMap API key.
- [x] 3.1.2. Create the API service module.
- [x] 3.1.3. Define API request configuration.
- [x] 3.1.4. Implement common response validation.
- [x] 3.1.5. Implement common error handling.

## 3.2. City Geocoding

- [x] 3.2.1. Implement city search requests.
- [x] 3.2.2. Define the city location data model.
- [x] 3.2.3. Implement autocomplete request debouncing.
- [x] 3.2.4. Implement search result selection.
- [x] 3.2.5. Handle empty search results.
- [x] 3.2.6. Handle failed search requests.
- [x] 3.2.7. Handle outdated autocomplete responses.

## 3.3. Weather Forecast Data

- [x] 3.3.1. Implement current weather retrieval if required by the selected API plan.
- [x] 3.3.2. Implement five-day forecast retrieval.
- [x] 3.3.3. Define normalized weather data models.
- [x] 3.3.4. Normalize timestamps and timezone information.
- [x] 3.3.5. Extract current-day forecast entries.
- [x] 3.3.6. Calculate daily average temperatures.
- [x] 3.3.7. Prepare chart datasets.
- [x] 3.3.8. Verify hourly forecast availability and granularity.
- [x] 3.3.9. Document the final forecast data strategy.

## 3.4. API Reliability

- [x] 3.4.1. Handle invalid API credentials.
- [x] 3.4.2. Handle city not found responses.
- [x] 3.4.3. Handle rate limiting.
- [x] 3.4.4. Handle network failures.
- [x] 3.4.5. Handle incomplete API responses.
- [x] 3.4.6. Verify independent request failure handling.

---

# PHASE 4. WEATHER WIDGETS

## 4.1. Weather Widget Foundation

- [x] 4.1.1. Create the WeatherWidget component.
- [x] 4.1.2. Define the widget properties.
- [x] 4.1.3. Define independent widget state.
- [x] 4.1.4. Implement city selection.
- [x] 4.1.5. Implement widget-specific loading state.
- [x] 4.1.6. Implement widget-specific error state.

## 4.2. Weather Information Card

- [x] 4.2.1. Create the weather card component.
- [x] 4.2.2. Display city information.
- [x] 4.2.3. Display temperature.
- [x] 4.2.4. Display weather conditions.
- [x] 4.2.5. Display weather icons.
- [x] 4.2.6. Display additional weather parameters.
- [x] 4.2.7. Handle unavailable weather values.

## 4.3. Multiple Widgets

- [x] 4.3.1. Implement the widgets collection.
- [x] 4.3.2. Add one default widget.
- [x] 4.3.3. Implement the add-widget button.
- [x] 4.3.4. Enforce the five-widget limit.
- [x] 4.3.5. Implement widget removal.
- [x] 4.3.6. Implement removal confirmation.
- [x] 4.3.7. Ensure stable widget identifiers.
- [x] 4.3.8. Verify widget state isolation.

---

# PHASE 5. TEMPERATURE VISUALIZATION

## 5.1. Chart.js Integration

- [x] 5.1.1. Install Chart.js.
- [x] 5.1.2. Create the chart component.
- [x] 5.1.3. Initialize Chart.js directly.
- [x] 5.1.4. Define chart configuration.
- [x] 5.1.5. Implement chart updates.
- [x] 5.1.6. Destroy chart instances on unmount.
- [x] 5.1.7. Handle empty datasets.

## 5.2. Current-Day Chart

- [x] 5.2.1. Extract current-day temperature data.
- [x] 5.2.2. Prepare time labels.
- [x] 5.2.3. Render temperature chart.
- [x] 5.2.4. Update the chart when the selected city changes.
- [x] 5.2.5. Verify chart behavior for independent widgets.

## 5.3. Five-Day Forecast

- [x] 5.3.1. Implement the Day / 5 Days switch.
- [x] 5.3.2. Group forecast entries by local calendar day.
- [x] 5.3.3. Calculate daily average temperature.
- [x] 5.3.4. Display daily weather cards.
- [x] 5.3.5. Create the five-day temperature chart.
- [x] 5.3.6. Verify date and timezone boundaries.

---

# PHASE 6. FAVORITES

## 6.1. Favorites Management

- [x] 6.1.1. Create the favorites store.
- [x] 6.1.2. Implement adding a city to favorites.
- [x] 6.1.3. Implement removing a city from favorites.
- [x] 6.1.4. Prevent duplicate favorites.
- [x] 6.1.5. Enforce the five-city limit.
- [x] 6.1.6. Implement the maximum-limit modal.
- [x] 6.1.7. Visually indicate favorite status.

## 6.2. Favorites Persistence

- [x] 6.2.1. Implement localStorage persistence.
- [x] 6.2.2. Restore favorites on application startup.
- [x] 6.2.3. Handle malformed stored data.
- [x] 6.2.4. Handle unavailable localStorage.

## 6.3. Favorites Interface

- [x] 6.3.1. Create the Favorites tab.
- [x] 6.3.2. Display favorite weather widgets.
- [x] 6.3.3. Remove city search from favorite widgets.
- [x] 6.3.4. Support Day / 5 Days switching.
- [x] 6.3.5. Support removing favorites from the tab.
- [x] 6.3.6. Implement empty favorites state.

---

# PHASE 7. LOCALIZATION AND DISPLAY MODES

## 7.1. Localization

- [x] 7.1.1. Configure Vue I18n.
- [x] 7.1.2. Create English translations.
- [x] 7.1.3. Create Ukrainian translations.
- [x] 7.1.4. Implement language switching.
- [x] 7.1.5. Persist the selected language.
- [x] 7.1.6. Pass the selected language to weather API requests.
- [x] 7.1.7. Verify localized weather descriptions.

## 7.2. Day / Night Display

- [x] 7.2.1. Finalize the meaning of Day / Night behavior.
- [x] 7.2.2. Implement the selected display mode.
- [x] 7.2.3. Verify behavior across weather widgets.
- [x] 7.2.4. Verify compatibility with localization.

## 7.3. Automatic Location

Moved into Phase 4.3 so the default dashboard widget can load a city on startup. Do not implement this section again.

- [x] 7.3.1. Select an IP geolocation provider.
- [x] 7.3.2. Implement IP-based city detection.
- [x] 7.3.3. Convert detected location into weather coordinates.
- [x] 7.3.4. Use the detected city for the initial widget.
- [x] 7.3.5. Implement a fallback location.
- [x] 7.3.6. Handle geolocation provider failures.

---

# PHASE 7.5. ROLLING 24-HOUR FORECAST

Intermediate subphase between Phase 7 and Phase 8. Completed Phase 7 tasks stay complete and are not reopened. The short-range chart uses available 3-hour forecast entries, not hourly data.

## 7.5.1. Rolling Window

- [x] 7.5.1. Include forecast entries from the current Unix time through that time plus 24 hours, inclusive.
- [x] 7.5.2. Keep those entries in chronological order and do not interpolate, duplicate, or add forecast requests.
- [x] 7.5.3. Label points with city-local `HH:MM` from the existing timezone offset.
- [x] 7.5.4. Leave the five-day list, its five-date limit, and the current weather card unchanged.
- [x] 7.5.5. Rename the short-range control to `24 Hours` / `24 години`.
- [x] 7.5.6. Record the rolling window in `PROJECT_SPEC.md` and `ARCHITECTURE.md`.

---

# PHASE 8. UI AND RESPONSIVE DESIGN

## 8.1. Visual Design

- [x] 8.1.1. Define design tokens.
- [x] 8.1.2. Define typography.
- [x] 8.1.3. Define spacing and layout rules.
- [x] 8.1.4. Define weather card styles.
- [x] 8.1.5. Define button and input styles.
- [x] 8.1.6. Define modal styles.
- [x] 8.1.7. Define loading and error styles.

## 8.2. Responsive Layout

- [x] 8.2.1. Implement desktop layout.
- [x] 8.2.2. Implement tablet layout.
- [x] 8.2.3. Implement mobile layout.
- [x] 8.2.4. Verify 1200px viewport.
- [x] 8.2.5. Verify 768px viewport.
- [x] 8.2.6. Verify 360px viewport.
- [x] 8.2.7. Fix horizontal overflow.
- [x] 8.2.8. Verify chart responsiveness.

## 8.3. Interaction Polish

- [x] 8.3.1. Add hover states.
- [x] 8.3.2. Add focus states.
- [x] 8.3.3. Add appropriate transitions.
- [x] 8.3.4. Verify keyboard interactions.
- [x] 8.3.5. Verify modal interactions.

---

# PHASE 9. TESTING AND QUALITY ASSURANCE

## 9.1. Unit Testing

- [x] 9.1.1. Test weather data normalization.
- [x] 9.1.2. Test daily average calculations.
- [x] 9.1.3. Test favorites management.
- [x] 9.1.4. Test localStorage utilities.
- [x] 9.1.5. Test API error handling.

## 9.2. Component Testing

- [ ] 9.2.1. Test WeatherWidget.
- [ ] 9.2.2. Test city autocomplete.
- [ ] 9.2.3. Test widget addition and removal.
- [ ] 9.2.4. Test favorites interface.
- [ ] 9.2.5. Test confirmation modals.
- [ ] 9.2.6. Test localization switching.

## 9.3. Integration Testing

- [ ] 9.3.1. Test city search and weather retrieval.
- [ ] 9.3.2. Test multiple independent widgets.
- [ ] 9.3.3. Test favorite persistence after reload.
- [ ] 9.3.4. Test Day / 5 Days switching.
- [ ] 9.3.5. Test API failure scenarios.

## 9.4. Final Quality Checks

- [ ] 9.4.1. Run the full test suite.
- [ ] 9.4.2. Run ESLint.
- [ ] 9.4.3. Run TypeScript checks.
- [ ] 9.4.4. Run production build.
- [ ] 9.4.5. Inspect browser console.
- [ ] 9.4.6. Verify mobile layout.
- [ ] 9.4.7. Verify API credentials are not exposed in Git history.

---

# PHASE 10. DOCUMENTATION AND DEPLOYMENT

## 10.1. Project Documentation

- [ ] 10.1.1. Update README setup instructions.
- [ ] 10.1.2. Document environment variables.
- [ ] 10.1.3. Document API limitations.
- [ ] 10.1.4. Document additional functionality.
- [ ] 10.1.5. Update project status.

## 10.2. Deployment

- [ ] 10.2.1. Select deployment platform.
- [ ] 10.2.2. Configure production environment variables.
- [ ] 10.2.3. Deploy the application.
- [ ] 10.2.4. Verify production API requests.
- [ ] 10.2.5. Verify production build.
- [ ] 10.2.6. Verify responsive behavior in production.

## 10.3. Final Submission

- [ ] 10.3.1. Verify GitHub repository.
- [ ] 10.3.2. Verify deployed application.
- [ ] 10.3.3. Prepare repository URL.
- [ ] 10.3.4. Prepare deployment URL.
- [ ] 10.3.5. Prepare final submission message.

---

# Development Log

## Initial State

- Project documentation structure defined.
- Original assignment requirements reviewed.
- Implementation not started.

## 1.2. Development Environment

- Initialized Vue 3 + TypeScript using the official Vite `vue-ts` template.
- Preserved existing documentation, README, and `.gitignore`.
- Added Pinia, Chart.js, and Vue I18n as runtime dependencies without wiring application features.
- Configured strict TypeScript project references, ESLint (Vue + TypeScript + Prettier), Prettier, and Vitest with a smoke test.
- Verified `type-check`, `lint`, `format:check`, `test:run`, `build`, and `dev`.

## 1.3. Project Configuration

- Created the initial `src/` directory structure from `ARCHITECTURE.md`, using `.gitkeep` for empty folders.
- Removed Vite demo components and assets.
- Added `.env.example` and typed the public Vite variable used at the time. No real key was added. Phase 3.1 removed that frontend key variable.
- Replaced the template stylesheet with a baseline global CSS file and kept `main.ts` as a minimal Vue mount.
- Verified type-check, lint, format, tests, production build, and the development server.

## 2.1. Core Architecture

- Documented module and component boundaries, normalized TypeScript models, independent widget state, favorites rules, and API service contracts in `ARCHITECTURE.md`.
- Decided that Weather / Favorites tabs use application state rather than Vue Router.
- Dashboard widget forecasts remain session-only; only favorite cities and settings are persisted.

## 2.2. Application Shell

- Implemented `AppLayout`, `AppHeader`, and `AppNav`, with `App.vue` composing placeholder `WeatherView` and `FavoritesView`.
- Weather / Favorites switching uses local tab state (no Vue Router), with `role="tablist"` / `aria-selected`.
- Shell has no Pinia, API, or weather business logic.

## 2.3. Shared UI Components

- Added generic `AppButton`, `LoadingIndicator`, `ErrorMessage`, `ConfirmModal`, and `EmptyState` under `src/components/common/`.
- Covered props, events, and modal confirm/cancel (including Escape) with component tests.
- Temporarily previewed the primitives on `WeatherView` for manual inspection; no weather or API logic.

## 3.1. API Configuration

- Added a Wrangler Worker that allowlists geocoding, current weather, and 5-day forecast requests. It attaches the OpenWeatherMap key on the server and returns generic JSON errors.
- Added `src/services/api`, which calls `VITE_API_BASE_URL` with `AbortSignal`, validates JSON payloads, and maps failures to `AppError`.
- Removed the frontend API key variable from `.env.example` and `src/vite-env.d.ts`. The Worker is deployed, and `OPENWEATHER_API_KEY` is configured as a Worker secret.
- Added unit tests for proxy allowlisting and frontend validation/error mapping. The test suite was not executed in this phase.

## 3.2. City Geocoding

- Added `CityLocation` and `geocodingService.search`, which maps validated geocoding places into normalized cities.
- Added `useCitySearch` with a 300ms debounce, a 2-character minimum, request cancellation, stale-response protection, and selection that pauses autocomplete until the query changes or the search is reset.
- Empty provider results stay an empty list. Failures stay `AppError`. `AbortError` is not shown as a search error.
- Added unit tests for the service and composable. The test suite was not executed in this phase.

## 3.3. Weather Forecast Data

- Added normalized weather models in `src/types/weather.ts` and `weatherService.load`, which calls the Worker `/weather` and `/forecast` routes.
- Current conditions come from `/weather`. The 5-day forecast is 3-hour slots from `/data/2.5/forecast`, not hourly data. The Worker does not expose a hourly product.
- Local dates add `city.timezone` seconds to each Unix timestamp and read the calendar date in UTC fields, so grouping does not use the browser timezone.
- Daily averages use only entries that exist for that city-local date. Chart datasets are plain `{ label, temperatureC }` points, with no Chart.js instance.
- Added unit tests for normalization, timezone grouping, current-day extraction, averages, chart datasets, and incomplete values. The test suite was not executed in this phase.

## 3.4. API Reliability

- Kept the existing `AppRequestError` mapping. A missing Worker secret stays generic `unknown`. Provider 401 and `cod` 401 stay `unauthorized`. HTTP 429 and `cod` 429 stay `rate_limit`. No retries were added.
- An upstream fetch or body-read failure is now `network`. Browser `AbortError` still propagates. Empty geocoding stays `[]`; HTTP 404 stays `not_found`.
- `WeatherForecast.current` is required. `weatherService.load` still fails the whole call if current weather or the forecast fails, and concurrent calls do not share results.
- Added client, worker, and weather-service tests for these cases. The test suite was not executed in this phase.

## 4.1. Weather Widget Foundation

- Added `WeatherWidget` and `CitySearch`. City search uses the existing `useCitySearch` composable. Weather requests go through `useWeatherWidget` and `weatherService`, with `AbortSignal`.
- Each widget instance keeps its own selected city, forecast, loading flag, error, and in-flight request. A newer request aborts the previous one and ignores a stale result. Unmount aborts the request.
- Searchable widgets select a city from autocomplete. Non-searchable widgets follow the `location` prop and hide search. `locale` defaults to `en` and is sent with the weather request. The forecast is stored and not rendered.
- The dashboard collection, add/remove, and the weather card were not started. No Pinia store was added.
- Added composable and component tests. The test suite was not executed in this phase.

## 4.2. Weather Information Card

- Added `WeatherCard`, a presentational card for one normalized `WeatherSnapshot` and its `CityLocation`. `WeatherWidget` renders it from the forecast already stored by `useWeatherWidget`.
- The card shows the city name and region, current temperature, condition text, the OpenWeatherMap icon for the stored icon code, and feels-like, humidity, wind, and pressure. Missing or non-finite values render as an em dash.
- No new weather request was added. Phase 4.3 (widget collection, add, and remove) was not started.

## 4.3. Multiple Widgets

- `WeatherView` now renders the dashboard. The shared UI preview and its demonstration modal were removed.
- `weatherWidgetsStore` keeps the session collection: one widget on startup, stable ids, add up to five, and remove only after `ConfirmModal`. The last widget cannot be removed. Search, loading, error, and forecast stay inside each `WeatherWidget`.
- The first widget is seeded from IP geolocation (`ipLocationService`, geojs.io, no API key). Those coordinates go through the existing `weatherService`. Failure or an incomplete response uses London. Phase 7.3 is satisfied here and should not be repeated.

## 5.1. Chart.js Integration

- Added `TemperatureChart`, which draws a responsive Chart.js line chart from `TemperatureChartPoint[]` and updates that same instance when the points change.
- An empty list renders a short empty state and does not create a chart. The instance is destroyed on unmount.
- `WeatherWidget` renders the chart once a forecast is available.

## 5.2. Current-Day Chart

- `WeatherWidget` passes `toWeatherChartDatasets(forecast).currentDay` into `TemperatureChart`. Points are that city's forecast entries for the current calendar day, using `timezoneOffsetSeconds`. Labels are `HH:MM`. Temperatures stay in Celsius. No extra request is made.
- A new city clears the previous forecast before the next result arrives, so the chart unmounts and cannot keep the previous city's points. Each widget computes points from its own forecast.
- If the current city-local day has no valid entries, the chart receives an empty list and keeps the existing empty state. Entries with a non-finite timestamp or temperature are already dropped during normalization.

## 5.3. Five-Day Forecast

- Each `WeatherWidget` keeps its own Day / 5 Days mode, defaulting to Day. Switching modes does not request weather again. Day mode still shows the current card and the current-day chart.
- 5 Days mode lists `forecast.daily` in its existing order: local date, average °C, and the normalized condition and icon when present. The same `TemperatureChart` receives `dailyAverages`. Missing days are not invented.
- Grouping, averages, labels, and timezone boundaries stay in `normalizeWeather`. A city change still clears the forecast before the next result, so the previous city's days cannot remain on screen.

## 6.1. Favorites Management

- Added `favoritesStore` for `CityLocation` entries only. It is separate from `weatherWidgetsStore`. Add and remove match cities by `lat` and `lon`. A duplicate add is a no-op. A sixth city is rejected. Nothing is written to localStorage.
- `WeatherWidget` shows a Favorite control once the current forecast is on screen. The control reflects `isFavorite` for that city and adds or removes it. At the five-city limit, `ConfirmModal` explains that an existing favorite must be removed first, and the city is not added.
- The Favorites tab and favorite weather widgets were not started.

## 6.3. Favorites Interface

- `FavoritesView` replaces the placeholder with the cities in `favoritesStore`. Each city is one `WeatherWidget` with search disabled and `location` set. The list key is that city's `lat,lon`.
- The widget's existing Favorite control removes the city, and the list updates immediately. Day / 5 Days stays inside each widget. An empty list shows `EmptyState`.
- Weather requests stay in each `WeatherWidget`. `weatherWidgetsStore` is not used. The existing Weather / Favorites tabs are unchanged.

## 7.1. Localization

- Configured Vue I18n with English and Ukrainian catalogs. `settingsStore` restores `panda-weather.locale` and falls back to `en` when the value is missing, invalid, or localStorage is unavailable.
- Replaced interface copy with those catalogs, including errors mapped from `AppError.code`. The header switches language immediately. Provider condition text is left unchanged.
- Dashboard and favorite widgets receive the selected `LocaleCode`. The existing per-widget reload aborts the previous request and ignores a stale response, so descriptions follow the new language.
- Added tests for locale persistence and for passing the selected locale into a favorite weather request.

## 7.2. Day / Night Display

- Day / Night is a global theme: Day is light and Night is dark. It is a user setting, independent of weather, time, and each widget's Day / 5 Days switch.
- `settingsStore` persists `panda-weather.theme` and falls back to `day` when the value is missing, invalid, or localStorage is unavailable. The header switches it immediately with sun and moon buttons that keep localized accessible names. `App` sets `data-theme` on the document, and shared CSS variables recolor Weather and Favorites.
- The product name is `Panda Weather` in both catalogs and the document title.
- The displayed five-day list and its chart use the first five city-local dates from `daily`. The three-hour entries used by Day mode are unchanged. The Day chart shows only forecast slots that remain on the city's local date; a single point late in that day is the provider data, not a missing chart update.
- Manual checks confirmed theme switching and persistence, both tabs, EN/UK in both themes, and independence from Day / 5 Days. Automated checks and live provider description checks were not run.

## 7.5. Rolling 24-Hour Forecast

- `currentDayForecastEntries` now keeps 3-hour `entries` with `timestampUnix >= now` and `timestampUnix <= now + 24 hours`. `toWeatherChartDatasets` still maps that series to `currentDay` with city-offset `HH:MM` labels. The five-day series and `WeatherCard` are unchanged.
- The short-range control reads `weather.day`: English `24 Hours`, Ukrainian `24 години`. Day / Night theme copy is unchanged.
- No hourly product, extra request, or synthetic chart point was added. Automated checks were not run.

## 8.1. Visual Design

- Shared Day and Night tokens in `global.css` now cover surfaces, text, borders, accent, feedback colors, radii, shadows, spacing, type scale, and short transitions. Theme switching and persistence are unchanged.
- Weather and Favorites cards, controls, the confirmation modal, and loading, error, and empty states use that scale. The temperature chart caption reads the existing `chart.label` plus `(°C)` for both ranges.
- Responsive layout was left for Phase 8.2. Automated checks were not run.

## 8.2. Responsive Layout

- Desktop stays the default: three widget columns from 1025 px up. From 1024 px down, including 768 px, the grid uses two columns. From 640 px down, including 360 px, it uses one column. Header controls wrap, and below 480 px the title stacks above them.
- Cards, search suggestions, the confirmation modal, and feedback states are constrained to their containers. The temperature chart keeps `responsive: true`, skips overlapping time labels, and keeps the existing unit caption above the canvas.
- Viewport checks at 1200 px, 768 px, and 360 px, and chart resize checks, are still open. Automated checks were not run.

## 8.3. Interaction Polish

- Hover stays on the existing controls. Selected header, theme, language, and navigation controls keep the accent surface and only change border color on hover. Primary, secondary, and destructive buttons already used separate hover fills.
- Keyboard focus uses the shared `:focus-visible` outline. Transitions stay on color, background, border, and shadow, and `prefers-reduced-motion: reduce` sets those durations to zero.
- City search keeps focus in the input: Arrow Up and Arrow Down move the active suggestion, Enter selects it, and Escape hides the current list. Existing navigation tabs already move with the arrow keys. The widget-removal modal keeps Cancel and Confirm, focuses Cancel, traps Tab inside its actions, closes on Escape, and returns focus to the opener when that element is still present.
- The favorites-limit modal keeps its existing title and message and shows only the existing OK action. Escape and backdrop click still close it. Widget removal is unchanged.
- Keyboard navigation and modal behavior were manually verified. Automated checks were not run.

## 9.1. Unit Testing

- Reused `normalizeWeather.spec.ts`, `favoritesStore.spec.ts`, `settingsStore.spec.ts`, `errors.spec.ts`, and `client.spec.ts`. Daily averages, favorite add/remove, the five-city limit, and HTTP, abort, and network error mapping were already covered.
- `currentDayForecastEntries` expectations now use the rolling 24-hour window: slots before `nowUnix` are dropped, the current instant and the exact `now + 24h` boundary stay, later slots are dropped, order stays chronological, and labels stay on the city offset. The Honolulu chart expectation was updated the same way. Daily averages were left as they were.
- Added theme save, restore, and invalid-value coverage, and a non-JSON 429 body check that the user-facing message does not include the raw text.
- `vitest run` on those five files: 5 files, 33 tests, all passed. Production code was not changed.

## Decisions Log

- Vue Router was not installed. Architecture treats routing as optional, and the current shell does not require it.
- Vite 6 was selected instead of the current Vite 8 template default because the local Node.js version is 20.18.2. Vite 8 requires Node `^20.19.0 || >=22.12.0`.
- OpenWeatherMap is reached only through the Cloudflare Worker. Wrangler is pinned to 4.86.0 because Wrangler 4.87+ requires Node.js 22, and the local runtime is Node.js 20.18.2.
- The frontend stores the Worker base URL in `VITE_API_BASE_URL`. The provider key is the Worker secret `OPENWEATHER_API_KEY`.
- Phase 4.1 keeps per-widget runtime state in `useWeatherWidget` instead of `weatherWidgetsStore`. The store remains the Phase 4.3 collection.

## Issues and Risks

- The Cloudflare Worker is deployed and `OPENWEATHER_API_KEY` is configured as a Worker secret.
- A caller that spoofs `Origin` can still use the three allowlisted routes. Add Cloudflare rate limiting before relying on the provider quota.
- Hourly forecast data is not available. `GET /forecast` proxies the 5-day / 3-hour forecast. Current conditions use `GET /weather`.
- The local `.env` may still contain the retired frontend key variable. Remove that variable and set `VITE_API_BASE_URL` locally. Do not commit `.env`.
