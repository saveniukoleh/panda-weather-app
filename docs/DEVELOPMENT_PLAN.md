
# Development Plan

## Project Status

- Overall status: In Progress
- Current phase: Phase 3 — OpenWeatherMap Integration
- Completed phases: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2
- Active phase: None (Phase 3.3 not started)

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

- [ ] 3.3.1. Implement current weather retrieval if required by the selected API plan.
- [ ] 3.3.2. Implement five-day forecast retrieval.
- [ ] 3.3.3. Define normalized weather data models.
- [ ] 3.3.4. Normalize timestamps and timezone information.
- [ ] 3.3.5. Extract current-day forecast entries.
- [ ] 3.3.6. Calculate daily average temperatures.
- [ ] 3.3.7. Prepare chart datasets.
- [ ] 3.3.8. Verify hourly forecast availability and granularity.
- [ ] 3.3.9. Document the final forecast data strategy.

## 3.4. API Reliability

- [ ] 3.4.1. Handle invalid API credentials.
- [ ] 3.4.2. Handle city not found responses.
- [ ] 3.4.3. Handle rate limiting.
- [ ] 3.4.4. Handle network failures.
- [ ] 3.4.5. Handle incomplete API responses.
- [ ] 3.4.6. Verify independent request failure handling.

---

# PHASE 4. WEATHER WIDGETS

## 4.1. Weather Widget Foundation

- [ ] 4.1.1. Create the WeatherWidget component.
- [ ] 4.1.2. Define the widget properties.
- [ ] 4.1.3. Define independent widget state.
- [ ] 4.1.4. Implement city selection.
- [ ] 4.1.5. Implement widget-specific loading state.
- [ ] 4.1.6. Implement widget-specific error state.

## 4.2. Weather Information Card

- [ ] 4.2.1. Create the weather card component.
- [ ] 4.2.2. Display city information.
- [ ] 4.2.3. Display temperature.
- [ ] 4.2.4. Display weather conditions.
- [ ] 4.2.5. Display weather icons.
- [ ] 4.2.6. Display additional weather parameters.
- [ ] 4.2.7. Handle unavailable weather values.

## 4.3. Multiple Widgets

- [ ] 4.3.1. Implement the widgets collection.
- [ ] 4.3.2. Add one default widget.
- [ ] 4.3.3. Implement the add-widget button.
- [ ] 4.3.4. Enforce the five-widget limit.
- [ ] 4.3.5. Implement widget removal.
- [ ] 4.3.6. Implement removal confirmation.
- [ ] 4.3.7. Ensure stable widget identifiers.
- [ ] 4.3.8. Verify widget state isolation.

---

# PHASE 5. TEMPERATURE VISUALIZATION

## 5.1. Chart.js Integration

- [ ] 5.1.1. Install Chart.js.
- [ ] 5.1.2. Create the chart component.
- [ ] 5.1.3. Initialize Chart.js directly.
- [ ] 5.1.4. Define chart configuration.
- [ ] 5.1.5. Implement chart updates.
- [ ] 5.1.6. Destroy chart instances on unmount.
- [ ] 5.1.7. Handle empty datasets.

## 5.2. Current-Day Chart

- [ ] 5.2.1. Extract current-day temperature data.
- [ ] 5.2.2. Prepare time labels.
- [ ] 5.2.3. Render temperature chart.
- [ ] 5.2.4. Update the chart when the selected city changes.
- [ ] 5.2.5. Verify chart behavior for independent widgets.

## 5.3. Five-Day Forecast

- [ ] 5.3.1. Implement the Day / 5 Days switch.
- [ ] 5.3.2. Group forecast entries by local calendar day.
- [ ] 5.3.3. Calculate daily average temperature.
- [ ] 5.3.4. Display daily weather cards.
- [ ] 5.3.5. Create the five-day temperature chart.
- [ ] 5.3.6. Verify date and timezone boundaries.

---

# PHASE 6. FAVORITES

## 6.1. Favorites Management

- [ ] 6.1.1. Create the favorites store.
- [ ] 6.1.2. Implement adding a city to favorites.
- [ ] 6.1.3. Implement removing a city from favorites.
- [ ] 6.1.4. Prevent duplicate favorites.
- [ ] 6.1.5. Enforce the five-city limit.
- [ ] 6.1.6. Implement the maximum-limit modal.
- [ ] 6.1.7. Visually indicate favorite status.

## 6.2. Favorites Persistence

- [ ] 6.2.1. Implement localStorage persistence.
- [ ] 6.2.2. Restore favorites on application startup.
- [ ] 6.2.3. Handle malformed stored data.
- [ ] 6.2.4. Handle unavailable localStorage.

## 6.3. Favorites Interface

- [ ] 6.3.1. Create the Favorites tab.
- [ ] 6.3.2. Display favorite weather widgets.
- [ ] 6.3.3. Remove city search from favorite widgets.
- [ ] 6.3.4. Support Day / 5 Days switching.
- [ ] 6.3.5. Support removing favorites from the tab.
- [ ] 6.3.6. Implement empty favorites state.

---

# PHASE 7. LOCALIZATION AND DISPLAY MODES

## 7.1. Localization

- [ ] 7.1.1. Configure Vue I18n.
- [ ] 7.1.2. Create English translations.
- [ ] 7.1.3. Create Ukrainian translations.
- [ ] 7.1.4. Implement language switching.
- [ ] 7.1.5. Persist the selected language.
- [ ] 7.1.6. Pass the selected language to weather API requests.
- [ ] 7.1.7. Verify localized weather descriptions.

## 7.2. Day / Night Display

- [ ] 7.2.1. Finalize the meaning of Day / Night behavior.
- [ ] 7.2.2. Implement the selected display mode.
- [ ] 7.2.3. Verify behavior across weather widgets.
- [ ] 7.2.4. Verify compatibility with localization.

## 7.3. Automatic Location

- [ ] 7.3.1. Select an IP geolocation provider.
- [ ] 7.3.2. Implement IP-based city detection.
- [ ] 7.3.3. Convert detected location into weather coordinates.
- [ ] 7.3.4. Use the detected city for the initial widget.
- [ ] 7.3.5. Implement a fallback location.
- [ ] 7.3.6. Handle geolocation provider failures.

---

# PHASE 8. UI AND RESPONSIVE DESIGN

## 8.1. Visual Design

- [ ] 8.1.1. Define design tokens.
- [ ] 8.1.2. Define typography.
- [ ] 8.1.3. Define spacing and layout rules.
- [ ] 8.1.4. Define weather card styles.
- [ ] 8.1.5. Define button and input styles.
- [ ] 8.1.6. Define modal styles.
- [ ] 8.1.7. Define loading and error styles.

## 8.2. Responsive Layout

- [ ] 8.2.1. Implement desktop layout.
- [ ] 8.2.2. Implement tablet layout.
- [ ] 8.2.3. Implement mobile layout.
- [ ] 8.2.4. Verify 1200px viewport.
- [ ] 8.2.5. Verify 768px viewport.
- [ ] 8.2.6. Verify 360px viewport.
- [ ] 8.2.7. Fix horizontal overflow.
- [ ] 8.2.8. Verify chart responsiveness.

## 8.3. Interaction Polish

- [ ] 8.3.1. Add hover states.
- [ ] 8.3.2. Add focus states.
- [ ] 8.3.3. Add appropriate transitions.
- [ ] 8.3.4. Verify keyboard interactions.
- [ ] 8.3.5. Verify modal interactions.

---

# PHASE 9. TESTING AND QUALITY ASSURANCE

## 9.1. Unit Testing

- [ ] 9.1.1. Test weather data normalization.
- [ ] 9.1.2. Test daily average calculations.
- [ ] 9.1.3. Test favorites management.
- [ ] 9.1.4. Test localStorage utilities.
- [ ] 9.1.5. Test API error handling.

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
- Removed the frontend API key variable from `.env.example` and `src/vite-env.d.ts`. The Worker was not authenticated, configured with a real secret, or deployed.
- Added unit tests for proxy allowlisting and frontend validation/error mapping. The test suite was not executed in this phase.

## 3.2. City Geocoding

- Added `CityLocation` and `geocodingService.search`, which maps validated geocoding places into normalized cities.
- Added `useCitySearch` with a 300ms debounce, a 2-character minimum, request cancellation, stale-response protection, and selection that pauses autocomplete until the query changes or the search is reset.
- Empty provider results stay an empty list. Failures stay `AppError`. `AbortError` is not shown as a search error.
- Added unit tests for the service and composable. The test suite was not executed in this phase.

## Decisions Log

- Vue Router was not installed. Architecture treats routing as optional, and the current shell does not require it.
- Vite 6 was selected instead of the current Vite 8 template default because the local Node.js version is 20.18.2. Vite 8 requires Node `^20.19.0 || >=22.12.0`.
- OpenWeatherMap is reached only through the Cloudflare Worker. Wrangler is pinned to 4.86.0 because Wrangler 4.87+ requires Node.js 22, and the local runtime is Node.js 20.18.2.
- The frontend stores the Worker base URL in `VITE_API_BASE_URL`. The provider key is the Worker secret `OPENWEATHER_API_KEY`.

## Issues and Risks

- Cloudflare is not authenticated or deployed. The secret is not set. Production `VITE_API_BASE_URL` is unknown until the Worker URL exists.
- A caller that spoofs `Origin` can still use the three allowlisted routes. Add Cloudflare rate limiting before relying on the provider quota.
- Hourly forecast access is still unverified. The proxy exposes the 5-day / 3-hour forecast and current weather only.
- The local `.env` may still contain the retired frontend key variable. Remove that variable and set `VITE_API_BASE_URL` locally. Do not commit `.env`.
