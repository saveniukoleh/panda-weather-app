
# API Integration Specification

## 1. API Provider

Primary weather data provider:

OpenWeatherMap

Official website:
https://openweathermap.org/

API documentation:
https://openweathermap.org/api

## 2. API Authentication

The application requires an OpenWeatherMap API key.

Store the key in an environment variable:

```env
VITE_OPENWEATHER_API_KEY=your_api_key
```

Do not commit `.env` files.

Provide `.env.example` without real credentials.

Important:
Vite environment variables prefixed with `VITE_` are exposed to the browser. The API key must not be considered secret in a frontend-only application. Use only a key intended for client-side use and review provider restrictions and quotas.

## 3. Geocoding API

Use the OpenWeatherMap Geocoding API to search for cities.

Proposed endpoint:

```text
https://api.openweathermap.org/geo/1.0/direct
```

Expected parameters:

- `q`: city search query.
- `limit`: maximum number of results.
- `appid`: API key.

Use latitude and longitude from the selected result for weather requests.

Do not rely on deprecated built-in city-name weather lookup where coordinates are available.

## 4. Weather Forecast API

The five-day forecast endpoint:

```text
https://api.openweathermap.org/data/2.5/forecast
```

Required parameters:

- `lat`
- `lon`
- `appid`

Optional parameters:

- `units=metric`
- `lang=en` or `lang=uk`

The standard 5-day forecast provides data in three-hour intervals.

This limitation must be considered when implementing the current-day temperature chart.

## 5. Current Weather API

Potential endpoint:

```text
https://api.openweathermap.org/data/2.5/weather
```

Use it if the selected API plan and implementation strategy require a separate current weather request.

Do not assume that a forecast entry is identical to real-time current weather.

## 6. Hourly Forecast Investigation

The assignment requests an hourly temperature chart for the current day.

Before implementation:

1. Verify available OpenWeatherMap API products.
2. Verify whether the account has access to the required hourly endpoint.
3. Verify the number of forecast hours returned.
4. Verify subscription requirements and quotas.
5. Compare the available API data with the assignment requirement.

Possible implementation strategies:

### Option A: Hourly Forecast

Use an endpoint that provides hourly data if it is available under the selected account plan.

### Option B: Three-Hour Forecast

If hourly data is unavailable, use the standard five-day forecast and display the actual three-hour forecast intervals.

Do not label three-hour forecast data as hourly data.

Document the final decision.

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

Create normalized internal weather models.

Do not expose raw API response structures throughout the component tree.

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

1. Obtain forecast measurements.
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

Handle at least:

- HTTP 400: invalid request.
- HTTP 401: invalid or missing API key.
- HTTP 404: location not found.
- HTTP 429: rate limit.
- Network failures.
- Unexpected response structure.

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

Record verified decisions here before implementation.

- Geocoding endpoint: Pending verification.
- Current weather endpoint: Pending verification.
- Forecast endpoint: Pending verification.
- Hourly forecast availability: Pending verification.
- API subscription requirements: Pending verification.
- IP geolocation provider: Pending selection.
- Request quota considerations: Pending verification.
