
# Testing Plan

## 1. Testing Goals

Ensure that all mandatory assignment requirements are implemented correctly.

Testing must cover:

- Business logic.
- API integration.
- Component behavior.
- Independent widget state.
- Favorites persistence.
- Responsive layout.
- Error handling.
- Production build.

## 2. Testing Tools

- Vitest.
- Vue Test Utils.
- TypeScript compiler.
- ESLint.
- Browser developer tools.

## 3. Unit Tests

### 3.1. Weather Data Utilities

Verify:

- Weather response normalization.
- Temperature conversion where applicable.
- Daily average calculations.
- Forecast grouping.
- Local timezone handling.

### 3.2. Favorites Utilities

Verify:

- Adding favorites.
- Removing favorites.
- Duplicate prevention.
- Maximum five favorites.
- localStorage serialization.
- Invalid stored data handling.

### 3.3. API Utilities

Verify:

- Successful responses.
- Failed HTTP responses.
- Network errors.
- Invalid API responses.
- Request cancellation.

## 4. Component Tests

### 4.1. City Autocomplete

- Input accepts city names.
- Suggestions are displayed.
- Loading state is displayed.
- Empty results are handled.
- Selecting a city emits the correct location.

### 4.2. Weather Widget

- Displays the selected city.
- Displays weather information.
- Displays loading state.
- Displays errors.
- Updates when the city changes.
- Maintains independent state.

### 4.3. Widget Collection

- One widget exists initially.
- Adding a widget works.
- Maximum five widgets is enforced.
- Removal requires confirmation.
- Canceling removal preserves the widget.
- Confirming removal removes the correct widget.

### 4.4. Favorites

- Favorites can be added.
- Favorites can be removed.
- Duplicate favorites are prevented.
- Maximum five favorites is enforced.
- Favorites persist after reload.
- Favorite widgets do not contain city search.

### 4.5. Charts

- Chart initializes correctly.
- Chart updates when data changes.
- Empty data is handled.
- Chart instance is destroyed on unmount.
- Different widgets do not share chart instances.

## 5. Integration Tests

Test complete user workflows.

### 5.1. City Search Workflow

1. Open the application.
2. Enter a city.
3. Select a suggestion.
4. Wait for weather data.
5. Verify weather card and chart.

### 5.2. Multiple Widgets Workflow

1. Open the application.
2. Add several widgets.
3. Select different cities.
4. Verify independent data.
5. Remove one widget.
6. Verify remaining widgets.

### 5.3. Favorites Workflow

1. Select a city.
2. Add it to favorites.
3. Open Favorites.
4. Verify the city appears.
5. Reload the application.
6. Verify persistence.
7. Remove the favorite.

### 5.4. Forecast Workflow

1. Select a city.
2. Open the five-day view.
3. Verify daily cards.
4. Verify average temperatures.
5. Return to the current-day view.

## 6. Error Scenario Testing

Verify:

- Invalid API key.
- City not found.
- API rate limit.
- No internet connection.
- Malformed API response.
- Missing weather fields.
- localStorage unavailable.
- IP geolocation failure.

## 7. Responsive Testing

Test at:

| Viewport | Purpose |
|---|---|
| 360px | Minimum mobile width |
| 390px | Typical mobile |
| 768px | Tablet |
| 1024px | Small desktop |
| 1200px | Desktop reference |
| 1440px | Large desktop |

Verify:

- No horizontal overflow.
- Cards fit the viewport.
- Charts remain readable.
- Buttons are accessible.
- Modals fit the screen.

## 8. Final Quality Checklist

- [ ] All mandatory requirements implemented.
- [ ] Optional requirements reviewed.
- [ ] No critical console errors.
- [ ] No TypeScript errors.
- [ ] ESLint passes.
- [ ] All tests pass.
- [ ] Production build succeeds.
- [ ] No API credentials committed.
- [ ] Mobile layout verified.
- [ ] Deployment verified.

## 9. Acceptance Criteria

The project is ready for submission only when:

1. All mandatory requirements are implemented.
2. The application works with valid API credentials.
3. Multiple widgets function independently.
4. Favorites work and persist.
5. Charts display the available forecast data correctly.
6. Responsive behavior is verified.
7. Critical error states are handled.
8. The application is deployed.
9. Both required submission links are available.
