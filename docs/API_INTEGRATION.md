
# API Integration Specification

## 1. API Provider

Primary weather data provider:

OpenWeatherMap

Official website:
https://openweathermap.org/

API documentation:
https://openweathermap.org/api

## 2. API Authentication

The browser never calls OpenWeatherMap and never sees the API key.

The Cloudflare Worker in `worker/` adds `appid` when it calls OpenWeatherMap. The only production secret is the Wrangler secret:

```text
OPENWEATHER_API_KEY
```

Do not put that key in Vite variables, source, docs, `wrangler.toml` `[vars]`, or Git. Local Wrangler reads `worker/.dev.vars`, which is gitignored. `worker/.dev.vars.example` has an empty placeholder.

The frontend only needs the Worker base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8787
```

Use the deployed `https` Worker URL for a production build. `.env.example` ships the variable empty. Do not commit `.env`.

A production build rejects an `http` base URL and rejects any `openweathermap.org` host, so the client cannot be pointed at the provider.

CORS allows `https://saveniukoleh.github.io`, comma-separated `ALLOWED_ORIGINS`, and local `http://localhost` or `http://127.0.0.1`. The browser must send an allowed `Origin`. CORS is not authentication: the Worker still allowlists paths, methods, and query parameters, and it refuses to forward arbitrary provider URLs.

## 3. Geocoding API

The frontend calls the Worker:

```text
GET {VITE_API_BASE_URL}/geocoding?q={query}&limit={1-5}
```

The Worker calls:

```text
https://api.openweathermap.org/geo/1.0/direct
```

Client parameters:

- `q`: required city search query, 1–100 characters, no control characters.
- `limit`: optional integer from 1 to 5. The Worker defaults it to 5.

The Worker adds `appid`. Clients cannot pass `appid` or any other parameter.

Use latitude and longitude from the selected result for weather requests.

Do not rely on deprecated built-in city-name weather lookup where coordinates are available.

## 4. Weather Forecast API

The frontend calls the Worker:

```text
GET {VITE_API_BASE_URL}/forecast?lat={lat}&lon={lon}&lang={en|uk}
```

The Worker calls:

```text
https://api.openweathermap.org/data/2.5/forecast
```

Client parameters:

- `lat`: required, -90 through 90.
- `lon`: required, -180 through 180.
- `lang`: optional `en` or `uk`.

The Worker always sends `units=metric` and `appid`. `units=imperial` and any unknown parameter are rejected.

The standard 5-day forecast provides data in three-hour intervals.

This limitation must be considered when implementing the current-day temperature chart.

## 5. Current Weather API

The frontend calls the Worker:

```text
GET {VITE_API_BASE_URL}/weather?lat={lat}&lon={lon}&lang={en|uk}
```

The Worker calls:

```text
https://api.openweathermap.org/data/2.5/weather
```

Parameters match the forecast route. The Worker sends `units=metric` and `appid`.

`weatherService.load` always requests this route. Current weather is required. A 3-hour forecast slot is not a substitute and is not used to fill a missing snapshot.

## 6. Hourly Forecast Investigation

The assignment asks for an hourly temperature chart for the current day.

Verified against the deployed Worker contract:

- `GET /forecast` proxies `https://api.openweathermap.org/data/2.5/forecast` only.
- That product is a 5-day forecast in **3-hour** steps (up to 40 slots). It is not an hourly forecast.
- The Worker has no One Call or `/data/2.5/forecast/hourly` route. Those products are not part of this API plan.
- The rolling 5-day window can touch six local calendar dates, and the first and last of those days often contain fewer than eight slots. Days without slots are omitted.

Decision: **Option B**. Charts use the actual 3-hour timestamps. Do not label those points as hourly data.

`GET /weather` supplies the current snapshot. A 3-hour slot is not treated as the live observation.

## 7. Language Support

Use the `lang` API parameter when supported.

Supported application languages:

- English: `en`
- Ukrainian: `uk`

Weather descriptions should be requested in the selected language.

Application UI translations must be handled separately through Vue I18n.

## 8. Units

Use metric units by default.

Temperature:
Celsius.

Wind speed:
Use the units returned by the selected API configuration and display the correct unit.

## 9. Data Models

### 9.1. City Location

```ts
interface CityLocation {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}
```

### 9.2. Weather Data

Normalized models live in `src/types/weather.ts`: `WeatherSnapshot`, `ForecastEntry`, `DailyForecast`, `WeatherForecast`, and `WeatherChartDatasets`.

Provider payload types stay in `src/services/api/validate.ts`. Components do not import them.

### 9.3. Forecast Data

Forecast data should contain:

- Timestamp.
- Temperature.
- Weather condition.
- Weather icon.
- Precipitation probability when available.
- Additional relevant weather parameters.

## 10. Daily Average Calculation

The assignment requests average daily temperature based on hourly forecast statistics.

Implementation:

1. Obtain the available 3-hour forecast measurements. Do not invent missing slots.
2. Convert timestamps to the target city's local time.
3. Group entries by local calendar day.
4. Calculate the arithmetic mean of available temperatures.
5. Use the result in the daily card and chart.

Formula:

```text
Average Temperature = Sum of temperatures / Number of measurements
```

Do not group forecast entries by UTC calendar date without considering the city's timezone.

## 11. Timezone Handling

OpenWeatherMap forecast timestamps are provided in Unix time.

The application must correctly handle the target city's local time.

Rules:

- Convert timestamps using the city's timezone information.
- Group forecast data by local calendar day.
- Avoid relying on the browser's local timezone for a different city.
- Verify date boundaries for cities in different timezones.

## 12. Request Management

- Debounce autocomplete requests.
- Avoid unnecessary duplicate requests.
- Handle outdated autocomplete responses.
- Use AbortController where appropriate.
- Keep widget requests independent.
- Handle failed requests without breaking the application.

## 13. Error Handling

The Worker returns `{ error: { code, message } }` for rejected requests and for provider failures. `message` is a fixed application string. Provider bodies are not forwarded.

The frontend maps those responses to `AppError`:

- HTTP 400, 403, or 405: `invalid_request`.
- HTTP 401: `unauthorized` (OpenWeatherMap rejected the credentials). A missing Worker secret is `unknown`.
- HTTP 404: `not_found`.
- HTTP 429: `rate_limit`.
- Network failures: `network`. This includes a failed browser `fetch` and a Worker upstream fetch or body-read failure (HTTP 502, code `network`). `AbortError` propagates and is not an `AppError`.
- Non-JSON or structurally invalid success payloads: `invalid_response`.
- Anything else: `unknown`. A missing or too-short Worker secret is HTTP 500 `unknown`. The public body does not say whether the secret is missing.

A provider HTTP 200 body whose `cod` is 400, 401, 404, or 429 is treated as that error. Redirects are not followed. The client does not retry.

Geocoding HTTP 200 with `[]` is an empty search result, not `not_found`. HTTP 404 is a failed request. Empty weather or forecast payloads are `invalid_response` when required fields are missing. Optional fields stay absent instead of being invented.

Public messages are fixed strings. Responses do not include the API key, the upstream URL, or the provider error body.

Do not display raw technical error messages directly to users.

## 14. IP Geolocation

The optional automatic location feature requires an external IP geolocation provider.

Provider selection must be documented before implementation.

Requirements:

- Retrieve approximate location based on IP.
- Obtain city or coordinates.
- Handle missing location data.
- Handle unavailable provider.
- Provide a fallback city.
- Do not block application startup indefinitely.

IP geolocation is approximate and must not be presented as precise GPS positioning.

## 15. API Documentation References

- OpenWeatherMap API: https://openweathermap.org/api
- Geocoding API: https://openweathermap.org/api/geocoding-api
- Five-day forecast: https://openweathermap.org/api/forecast5
- Current weather: https://openweathermap.org/api/current

## 16. Final API Decisions

Decisions made for the Phase 3.1 proxy:

- Authentication: Worker secret `OPENWEATHER_API_KEY`. The Worker is deployed and the secret is configured.
- Frontend configuration: `VITE_API_BASE_URL` only.
- Geocoding: `GET /geocoding` proxies `https://api.openweathermap.org/geo/1.0/direct`.
- Current weather: `GET /weather` proxies `https://api.openweathermap.org/data/2.5/weather`.
- Forecast: `GET /forecast` proxies `https://api.openweathermap.org/data/2.5/forecast`.
- Units: the Worker always requests `metric`.
- Language: optional `lang=en` or `lang=uk`.
- Browser origins: `https://saveniukoleh.github.io`, plus local `http://localhost` and `http://127.0.0.1`.
- Wrangler is pinned to 4.86.0 because this environment uses Node.js 20.18.2. Wrangler 4.87 and newer require Node.js 22.

Forecast decision:

- Hourly forecast is not available on the exposed plan. The app uses the 5-day / 3-hour forecast plus the current-weather route. See section 6.

Still pending:

- API subscription limits beyond the routes already exposed.
- IP geolocation provider: pending selection.
- Provider quota and optional Cloudflare rate limiting: pending. The allowlist is not a quota control; a caller that spoofs `Origin` can still reach the three routes.
