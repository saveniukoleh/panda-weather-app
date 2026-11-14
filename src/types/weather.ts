import type { CityLocation } from './city';

export interface WeatherCondition {
  description: string;
  icon: string;
}

export interface WeatherSnapshot {
  temperatureC: number;
  feelsLikeC: number | null;
  humidity: number | null;
  windSpeed: number | null;
  pressure: number | null;
  condition: WeatherCondition | null;
}

export interface ForecastEntry {
  timestampUnix: number;
  temperatureC: number;
  condition: WeatherCondition | null;
  precipitationProbability: number | null;
}

export interface DailyForecast {
  localDate: string;
  averageTemperatureC: number;
  condition: WeatherCondition | null;
  entryCount: number;
}

export interface WeatherForecast {
  location: CityLocation;
  timezoneOffsetSeconds: number;
  current: WeatherSnapshot | null;
  entries: ForecastEntry[];
  daily: DailyForecast[];
}

export interface TemperatureChartPoint {
  label: string;
  temperatureC: number;
}

export interface WeatherChartDatasets {
  currentDay: TemperatureChartPoint[];
  dailyAverages: TemperatureChartPoint[];
}
