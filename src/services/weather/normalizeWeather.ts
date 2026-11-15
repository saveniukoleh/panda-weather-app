import type { CurrentWeatherPayload, ForecastPayload } from '../api/validate';
import type { CityLocation } from '../../types/city';
import type {
  DailyForecast,
  ForecastEntry,
  WeatherChartDatasets,
  WeatherCondition,
  WeatherForecast,
  WeatherSnapshot,
} from '../../types/weather';

const NOON_MINUTES = 12 * 60;
const MAX_DISPLAYED_DAILY_DAYS = 5;

export function normalizeCurrentWeather(payload: CurrentWeatherPayload): WeatherSnapshot {
  return {
    temperatureC: payload.main.temp,
    feelsLikeC: optionalNumber(payload.main.feels_like),
    humidity: optionalNumber(payload.main.humidity),
    windSpeed: optionalNumber(payload.wind?.speed),
    pressure: optionalNumber(payload.main.pressure),
    condition: firstCondition(payload.weather),
  };
}

export function normalizeWeatherForecast(
  location: CityLocation,
  current: CurrentWeatherPayload,
  forecast: ForecastPayload,
): WeatherForecast {
  const timezoneOffsetSeconds = forecast.city.timezone;
  const entries = forecast.list
    .map(toForecastEntry)
    .filter((entry): entry is ForecastEntry => entry !== null)
    .sort((left, right) => left.timestampUnix - right.timestampUnix);

  return {
    location,
    timezoneOffsetSeconds,
    current: normalizeCurrentWeather(current),
    entries,
    daily: dailyForecasts(entries, timezoneOffsetSeconds),
  };
}

export function localCalendarDate(timestampUnix: number, timezoneOffsetSeconds: number): string {
  const shifted = shiftedDate(timestampUnix, timezoneOffsetSeconds);
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  return `${shifted.getUTCFullYear()}-${pad2(month)}-${pad2(day)}`;
}

export function currentDayForecastEntries(
  forecast: WeatherForecast,
  nowUnix: number = unixNow(),
): ForecastEntry[] {
  const today = localCalendarDate(nowUnix, forecast.timezoneOffsetSeconds);
  return forecast.entries.filter(
    (entry) => localCalendarDate(entry.timestampUnix, forecast.timezoneOffsetSeconds) === today,
  );
}

export function toWeatherChartDatasets(
  forecast: WeatherForecast,
  nowUnix: number = unixNow(),
): WeatherChartDatasets {
  return {
    currentDay: currentDayForecastEntries(forecast, nowUnix).map((entry) => ({
      label: localTimeLabel(entry.timestampUnix, forecast.timezoneOffsetSeconds),
      temperatureC: entry.temperatureC,
    })),
    dailyAverages: forecast.daily.map((day) => ({
      label: day.localDate,
      temperatureC: day.averageTemperatureC,
    })),
  };
}

function toForecastEntry(entry: ForecastPayload['list'][number]): ForecastEntry | null {
  if (!Number.isFinite(entry.dt) || !Number.isFinite(entry.main.temp)) return null;
  return {
    timestampUnix: entry.dt,
    temperatureC: entry.main.temp,
    condition: firstCondition(entry.weather),
    precipitationProbability: optionalNumber(entry.pop),
  };
}

function dailyForecasts(entries: ForecastEntry[], timezoneOffsetSeconds: number): DailyForecast[] {
  const groups = new Map<string, ForecastEntry[]>();
  for (const entry of entries) {
    const localDate = localCalendarDate(entry.timestampUnix, timezoneOffsetSeconds);
    const group = groups.get(localDate);
    if (group) group.push(entry);
    else groups.set(localDate, [entry]);
  }

  const days: DailyForecast[] = [];
  for (const [localDate, group] of groups) {
    days.push({
      localDate,
      averageTemperatureC: averageTemperature(group),
      condition: conditionNearestNoon(group, timezoneOffsetSeconds),
      entryCount: group.length,
    });
  }
  days.sort((left, right) => left.localDate.localeCompare(right.localDate));
  return days.slice(0, MAX_DISPLAYED_DAILY_DAYS);
}

function averageTemperature(entries: ForecastEntry[]): number {
  let sum = 0;
  for (const entry of entries) sum += entry.temperatureC;
  return sum / entries.length;
}

function conditionNearestNoon(
  entries: ForecastEntry[],
  timezoneOffsetSeconds: number,
): WeatherCondition | null {
  let selected: WeatherCondition | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const entry of entries) {
    if (!entry.condition) continue;
    const distance = Math.abs(
      minutesFromMidnight(entry.timestampUnix, timezoneOffsetSeconds) - NOON_MINUTES,
    );
    if (distance < bestDistance) {
      selected = entry.condition;
      bestDistance = distance;
    }
  }
  return selected;
}

function firstCondition(
  weather: { description: string; icon: string }[] | undefined,
): WeatherCondition | null {
  const condition = weather?.[0];
  if (!condition) return null;
  if (condition.description.trim() === '' || condition.icon.trim() === '') return null;
  return { description: condition.description, icon: condition.icon };
}

function localTimeLabel(timestampUnix: number, timezoneOffsetSeconds: number): string {
  const shifted = shiftedDate(timestampUnix, timezoneOffsetSeconds);
  return `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`;
}

function minutesFromMidnight(timestampUnix: number, timezoneOffsetSeconds: number): number {
  const shifted = shiftedDate(timestampUnix, timezoneOffsetSeconds);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

function shiftedDate(timestampUnix: number, timezoneOffsetSeconds: number): Date {
  return new Date((timestampUnix + timezoneOffsetSeconds) * 1000);
}

function optionalNumber(value: number | undefined): number | null {
  return value === undefined || !Number.isFinite(value) ? null : value;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}
