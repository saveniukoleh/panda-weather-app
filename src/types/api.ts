export type AppErrorCode =
  | 'network'
  | 'unauthorized'
  | 'not_found'
  | 'rate_limit'
  | 'invalid_request'
  | 'invalid_response'
  | 'unknown';

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export type WeatherLanguage = 'en' | 'uk';

export interface GeocodingQuery {
  q: string;
  limit?: number;
}

export interface WeatherQuery {
  lat: number;
  lon: number;
  lang?: WeatherLanguage;
}
