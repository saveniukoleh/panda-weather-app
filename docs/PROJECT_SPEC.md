
# Project Specification

## 1. Project Overview

Panda Weather App is a responsive weather dashboard built with Vue.js and the OpenWeatherMap API.

The application allows users to search for cities, view weather information, compare forecasts, manage multiple weather widgets, and save favorite locations.

The application is developed as a technical assessment for Panda Team.

## 2. Original Assignment Requirements

Requirements are divided into mandatory functionality and optional enhancements according to the original assignment.

### 2.1. Mandatory Requirements

#### 2.1.1. City Search

- Provide a city search input.
- Implement autocomplete suggestions.
- Allow users to select a city from suggestions.
- Use the OpenWeatherMap API for location lookup.
- Handle empty queries and unsuccessful searches.

#### 2.1.2. API Requests

- Use Fetch API or Axios.
- Retrieve weather information from OpenWeatherMap.
- Handle unsuccessful HTTP responses.
- Handle network errors.
- Avoid unnecessary duplicate requests.

#### 2.1.3. Current Day Weather

- Display weather information in a dedicated card.
- Show the selected city.
- Show current or relevant current-day temperature.
- Display weather conditions and an appropriate icon.
- Display additional useful weather parameters when available.

#### 2.1.4. Temperature Chart

- Display a temperature chart for the current day.
- Use a JavaScript charting library such as Chart.js.
- Do not use vue-chartjs or another Vue wrapper for Chart.js.
- Use the Chart.js JavaScript API directly.

Note: The exact availability and granularity of hourly forecast data must be verified before implementation.

#### 2.1.5. Multiple Weather Widgets

- Display one weather widget by default.
- Allow users to add additional widgets using a "+" button.
- Maximum number of widgets: 5.
- Each widget must provide full weather functionality.
- Each widget must maintain independent state.
- Changes to one widget must not affect other widgets.

#### 2.1.6. Widget Removal

- Allow users to remove weather widgets.
- Display a confirmation modal before deletion.
- Canceling the modal must preserve the widget.
- Confirming deletion must remove only the selected widget.
- The application must not allow removal of the last remaining widget unless the product behavior is explicitly redesigned.

#### 2.1.7. Favorites

- Provide a dedicated Favorites tab.
- Allow users to add cities to favorites.
- Allow users to remove cities from favorites.
- Visually indicate whether a city is already a favorite.
- Display favorite cities as weather widgets.
- Favorite widgets must not contain a city search input.
- Favorite widgets must support Day / 5 Days switching.
- Store favorites in localStorage.
- Maximum number of favorite cities: 5.
- If the limit is reached, display a modal explaining that a favorite must be removed before adding another city.

#### 2.1.8. Responsive Layout

- Minimum supported viewport width: 360px.
- Desktop reference container width: 1200px.
- Layout must adapt to smaller screens.
- No horizontal overflow at supported viewport sizes.

### 2.2. Optional Enhancements

These requirements are marked as optional in the original assignment.

#### 2.2.1. Five-Day Forecast

- Add a Day / 5 Days display switch.
- Display a weather card for each forecast day.
- Calculate daily average temperature from available forecast measurements.
- Display a temperature chart by day.
- Use OpenWeatherMap forecast data.

#### 2.2.2. Automatic User Location

- Detect the user's approximate city using their IP address.
- Use an external IP geolocation service.
- Use the detected city as the initial weather location.
- Provide a fallback if geolocation fails.

#### 2.2.3. Loading Indicators

- Display loading indicators while API requests are in progress.
- Prevent confusing or empty UI during loading.
- Support independent loading states for each weather widget.

#### 2.2.4. Localization

- Support English and Ukrainian interfaces.
- Request localized weather descriptions from OpenWeatherMap where supported.
- Keep interface translations independent from API response translations.
- Allow users to switch languages.

#### 2.2.5. Day / Night Display

- Implement the Day / Night display functionality described in the assignment.
- Before implementation, define whether this means a visual theme switch, a weather-data display mode, or both.
- Keep this behavior independent from the Day / 5 Days forecast switch.

#### 2.2.6. Additional Functionality

Any additional functionality should be documented in the README and briefly described in the final project submission.

## 3. Non-Functional Requirements

### 3.1. Maintainability

- Use modular application architecture.
- Keep components focused on specific responsibilities.
- Separate API communication from UI components.
- Use TypeScript types for important data structures.
- Avoid unnecessary duplication.

### 3.2. Performance

- Debounce city autocomplete requests.
- Avoid unnecessary API requests.
- Avoid unnecessary component re-rendering.
- Properly manage Chart.js instances.
- Cancel or ignore outdated search requests where appropriate.

### 3.3. Reliability

- Handle API errors.
- Handle invalid city searches.
- Handle empty API responses.
- Handle localStorage errors.
- Handle missing weather parameters.
- Preserve the functionality of independent widgets if one request fails.

### 3.4. Accessibility

- Use semantic HTML.
- Provide accessible labels for controls.
- Ensure keyboard navigation for interactive elements.
- Make modal dialogs accessible.
- Maintain sufficient visual contrast.

## 4. Business Rules

| Rule | Limit |
|---|---|
| Default weather widgets | 1 |
| Maximum weather widgets | 5 |
| Maximum favorite cities | 5 |
| Minimum viewport width | 360px |
| Desktop container reference | 1200px |

## 5. Out of Scope

Unless explicitly added later:

- User registration.
- Backend account management.
- Cloud synchronization of favorites.
- Paid subscriptions.
- Weather alerts and notifications.
- Historical weather analytics.

## 6. Final Deliverables

The original assignment requires:

1. GitHub repository URL.
2. Publicly deployed application URL.

Both links must be provided when submitting the completed assignment.

## 7. Requirement Traceability

Every requirement must be linked to one or more tasks in `DEVELOPMENT_PLAN.md`.

The development plan must not silently omit any mandatory assignment requirement.
