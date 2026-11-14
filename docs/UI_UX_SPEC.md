
# UI/UX Specification

## 1. Design Goals

The application should provide a modern, clear, and intuitive weather dashboard.

Primary goals:

- Easy city search.
- Clear weather information hierarchy.
- Readable temperature charts.
- Independent weather widgets.
- Intuitive favorites management.
- Responsive behavior.
- Consistent visual language.

## 2. Main Application Layout

The application should contain:

1. Header.
2. Application navigation.
3. Main weather dashboard.
4. Weather widgets collection.
5. Favorites view.

## 3. Header

The header should contain:

- Application logo or title.
- Language selector.
- Day / Night display control if implemented as a theme switch.

## 4. Navigation

Main tabs:

- Weather.
- Favorites.

Switching tabs must preserve relevant application state.

## 5. Weather Dashboard

The main dashboard should display one or more weather widgets.

A "+" control allows adding a widget.

Maximum number of widgets: five.

The add control should be disabled or hidden when the limit is reached.

## 6. Weather Widget

Each widget should contain:

- City autocomplete input.
- Selected city name.
- Weather card.
- Temperature chart.
- Day / 5 Days switch.
- Favorite control.
- Remove control.
- Loading and error states.

Each widget must be visually distinguishable from other widgets.

## 7. Weather Card

The weather card should prioritize:

1. City name.
2. Current or relevant forecast temperature.
3. Weather condition.
4. Weather icon.
5. Additional weather details.

Additional parameters may include:

- Feels-like temperature.
- Humidity.
- Wind speed.
- Pressure.

Only display parameters supported by the API response.

## 8. City Autocomplete

Autocomplete behavior:

- Suggestions appear after a reasonable input length.
- Requests are debounced.
- Loading state is visible.
- Results display city and country.
- Empty results are handled.
- Selecting a result updates only the relevant widget.

## 9. Temperature Chart

Use Chart.js directly.

Chart requirements:

- Responsive width.
- Readable time or date labels.
- Temperature values in Celsius.
- Tooltips.
- Clear visual hierarchy.
- Proper empty and loading states.

The chart must update when the selected city or forecast mode changes.

## 10. Favorites

Favorites view should display weather widgets for saved cities.

Favorite widgets:

- Must not contain city search.
- Must support Day / 5 Days switching.
- Must provide a way to remove the city from favorites.

When the user reaches five favorites, show a modal explaining the limit.

## 11. Modals

Required modals:

### 11.1. Widget Removal

Explain that the selected widget will be removed.

Actions:

- Cancel.
- Confirm removal.

### 11.2. Favorites Limit

Explain that the maximum number of favorite cities is five.

Tell the user to remove an existing favorite before adding another city.

## 12. Loading States

Provide loading feedback for:

- City autocomplete.
- Initial weather retrieval.
- Forecast retrieval.
- Favorite weather widgets.
- Automatic location detection.

Loading in one widget must not block other widgets.

## 13. Error States

Provide clear messages for:

- City not found.
- Network failure.
- API failure.
- Missing weather data.
- Empty favorites.

## 14. Responsive Design

Minimum viewport width: 360px.

Desktop reference container: 1200px.

### Desktop

- Multi-column widget layout where appropriate.
- Comfortable spacing.
- Charts should use available width.

### Tablet

- Reduced column count.
- Adjusted spacing.
- Preserve readability.

### Mobile

- Single-column layout.
- Touch-friendly controls.
- No horizontal scrolling.
- Readable charts and labels.
- Modals must fit the viewport.

## 15. Accessibility

- Semantic HTML.
- Accessible button names.
- Visible focus indicators.
- Keyboard-accessible interactions.
- Accessible modal behavior.
- Sufficient contrast.
- Avoid color-only status indicators.

## 16. Visual Design Decisions

The following will be decided during UI implementation:

- Color palette.
- Typography.
- Border radius.
- Shadows.
- Icon style.
- Chart appearance.
- Day / Night visual treatment.

Avoid introducing a CSS framework or UI library.
